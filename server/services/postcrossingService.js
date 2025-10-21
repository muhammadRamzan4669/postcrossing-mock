import mongoose from 'mongoose';
import { User, computeMaxSlots } from '../models/User.js';
import { Address } from '../models/Address.js';
import { Counter, buildPostcardCode } from '../models/Counter.js';
import { Postcard } from '../models/Postcard.js';
import { ReceivePool } from '../models/ReceivePool.js';

/**
 * Build a normalized snapshot of an Address document.
 */
function snapshotAddress(addrDoc) {
  const { fullName, line1, line2, city, postalCode, countryCode } = addrDoc;
  return { fullName, line1, line2, city, postalCode, countryCode };
}

/**
 * Generate the next postcard code for a sender's country.
 */
async function nextPostcardCode(countryCode, session) {
  const seq = await Counter.incrementAndGet(countryCode, session);
  return buildPostcardCode(countryCode, seq);
}

/**
 * Attempt to pick a recipient for the given sender.
 * Strategy:
 * 1) Try to pop an eligible credit from ReceivePool (FIFO).
 * 2) Fallback to a random eligible user (not self, optional cross-country).
 */
async function pickRecipientFor(sender, session) {
  const avoidSameCountry = !sender?.preferences?.allowSameCountry;

  // 1) Prefer someone from the receive pool (reciprocity)
  const credit = await ReceivePool.takeOldestEligible(
    sender._id,
    sender.countryCode,
    avoidSameCountry,
    session
  );

  if (credit) {
    const recipient = await User.findById(credit.userId).session(session);
    if (recipient) return recipient;
    // If the credited user no longer exists, continue to fallback.
  }

  // 2) Fallback: random eligible user
  const pipeline = [
    { $match: { _id: { $ne: sender._id } } },
    ...(avoidSameCountry ? [{ $match: { countryCode: { $ne: sender.countryCode } } }] : []),
    { $sample: { size: 8 } } // sample a few to increase chance of having a primary address
  ];

  const candidates = await User.aggregate(pipeline).session(session);
  for (const c of candidates) {
    // Ensure candidate has a primary address
    const addr = await Address.findOne({ userId: c._id, isPrimary: true }).session(session);
    if (addr) {
      const u = await User.findById(c._id).session(session);
      return u;
    }
  }

  return null;
}

/**
 * Request an address to send a postcard to for a given sender.
 * Enforces traveling slot limit and creates a `Postcard` in "traveling" state.
 *
 * Returns:
 *  - { ok: true, postcard }
 *  - { ok: false, error }
 */
export async function requestAddressToSend(senderId) {
  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      const sender = await User.findById(senderId).session(session);
      if (!sender) return { ok: false, error: 'Sender not found' };

      // Verify sender has a primary address (not strictly necessary to send, but good sanity check)
      const senderAddr = await Address.findOne({ userId: sender._id, isPrimary: true }).session(session);
      if (!senderAddr) return { ok: false, error: 'Sender has no primary address on file' };

      // Enforce traveling slots
      const maxSlots = sender.maxTravelingSlots();
      if ((sender.stats?.traveling || 0) >= maxSlots) {
        return {
          ok: false,
          error: `No free slots. Traveling=${sender.stats.traveling}, Max=${maxSlots}`
        };
      }

      const recipient = await pickRecipientFor(sender, session);
      if (!recipient) return { ok: false, error: 'No eligible recipient found' };

      const recipAddr = await Address.findOne({ userId: recipient._id, isPrimary: true }).session(session);
      if (!recipAddr) return { ok: false, error: 'Recipient has no primary address on file' };

      const code = await nextPostcardCode(sender.countryCode, session);

      const [postcard] = await Postcard.create(
        [
          {
            code,
            senderId: sender._id,
            senderCountryCode: sender.countryCode,
            recipientId: recipient._id,
            recipientAddressSnapshot: snapshotAddress(recipAddr),
            status: 'traveling',
            requestedAt: new Date()
          }
        ],
        { session }
      );

      // Update sender traveling count
      await User.updateOne(
        { _id: sender._id },
        { $inc: { 'stats.traveling': 1 } }
      ).session(session);

      return { ok: true, postcard };
    });

    return result;
  } finally {
    session.endSession();
  }
}

/**
 * Register a postcard as received by its code.
 * This will:
 *  - Mark the postcard as "received" and set receivedAt
 *  - Update sender stats (sent +1, traveling -1)
 *  - Update recipient stats (received +1)
 *  - Grant 1 receive credit to the sender (insert into ReceivePool)
 *
 * Returns:
 *  - { ok: true, postcard }
 *  - { ok: false, error }
 */
export async function registerReceived(postcardCode, _actingUserId = null) {
  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      const pc = await Postcard.findOne({ code: String(postcardCode).toUpperCase() }).session(session);
      if (!pc) return { ok: false, error: 'Invalid postcard code' };
      if (pc.status === 'received') return { ok: false, error: 'Postcard already registered as received' };

      pc.status = 'received';
      pc.receivedAt = new Date();
      await pc.save({ session });

      // Update stats
      await User.updateOne(
        { _id: pc.senderId },
        { $inc: { 'stats.sent': 1, 'stats.traveling': -1 } }
      ).session(session);

      await User.updateOne(
        { _id: pc.recipientId },
        { $inc: { 'stats.received': 1 } }
      ).session(session);

      // Reciprocity: grant 1 credit to sender
      const sender = await User.findById(pc.senderId).session(session);
      if (sender) {
        await ReceivePool.grantCredits(sender._id, sender.countryCode, 1, session);
      }

      return { ok: true, postcard: pc };
    });

    return result;
  } finally {
    session.endSession();
  }
}

/**
 * List postcards currently traveling for a given user (as sender).
 */
export async function listTraveling(userId) {
  const items = await Postcard.find({ senderId: userId, status: 'traveling' })
    .sort({ requestedAt: -1 })
    .lean();
  return items;
}

/**
 * Get summarized stats for a user, including computed max slots.
 */
export async function getStats(userId) {
  const user = await User.findById(userId).lean();
  if (!user) throw new Error('User not found');

  const sent = user?.stats?.sent || 0;
  const received = user?.stats?.received || 0;
  const traveling = user?.stats?.traveling || 0;
  const expired = user?.stats?.expired || 0;
  const maxSlots = computeMaxSlots(received);

  return {
    username: user.username,
    countryCode: user.countryCode,
    sent,
    received,
    traveling,
    expired,
    maxSlots
  };
}
