import mongoose from 'mongoose';

/**
 * ReceivePool
 * ------------
 * Represents a single "receive credit" for a user. When someone registers a
 * postcard as received, the sender earns one credit and their address becomes
 * eligible to be drawn by another user who clicks "Send a card".
 *
 * Each document = 1 credit. FIFO ordering by createdAt is used when assigning.
 */
const receivePoolSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    countryCode: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 3,
      set: (v) => (v ? String(v).toUpperCase() : v),
      index: true
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
      index: true
    }
  },
  {
    versionKey: false
  }
);

// Helpful compound index for FIFO selection within country partitions.
receivePoolSchema.index({ countryCode: 1, createdAt: 1 });

/**
 * Grant one or more receive credits to a user.
 * Inserts N documents (one per credit) to preserve FIFO semantics naturally.
 *
 * @param {mongoose.Types.ObjectId|string} userId
 * @param {string} countryCode
 * @param {number} [count=1]
 * @param {mongoose.ClientSession} [session]
 * @returns {Promise<Array>}
 */
receivePoolSchema.statics.grantCredits = async function grantCredits(
  userId,
  countryCode,
  count = 1,
  session
) {
  const n = Math.max(0, Math.floor(count || 0));
  if (n === 0) return [];

  const docs = Array.from({ length: n }, () => ({
    userId,
    countryCode: String(countryCode).toUpperCase()
  }));

  return this.insertMany(docs, { session });
};

/**
 * Pop the oldest eligible credit for a sender, honoring simple constraints:
 * - Not self
 * - Optionally avoid same-country matches
 *
 * Returns the removed credit document (or null if none).
 *
 * @param {mongoose.Types.ObjectId|string} senderId
 * @param {string} senderCountryCode
 * @param {boolean} avoidSameCountry
 * @param {mongoose.ClientSession} [session]
 * @returns {Promise<null|{_id: any, userId: any, countryCode: string, createdAt: Date}>}
 */
receivePoolSchema.statics.takeOldestEligible = async function takeOldestEligible(
  senderId,
  senderCountryCode,
  avoidSameCountry,
  session
) {
  const query = {
    userId: { $ne: senderId }
  };
  if (avoidSameCountry) {
    query.countryCode = { $ne: String(senderCountryCode).toUpperCase() };
  }

  // Atomically pick and remove the oldest eligible credit
  return this.findOneAndDelete(query, {
    sort: { createdAt: 1 },
    session
  });
};

export const ReceivePool = mongoose.model('ReceivePool', receivePoolSchema);
