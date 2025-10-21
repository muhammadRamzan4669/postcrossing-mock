import express from 'express';
import { z } from 'zod';
import { User, computeMaxSlots } from '../models/User.js';
import { Address } from '../models/Address.js';

export const router = express.Router();

/**
 * POST /api/users/register
 * Registers a new user and their primary address.
 * Body:
 * {
 *   "username": "alice",
 *   "email": "alice@example.com",
 *   "countryCode": "US",
 *   "fullName": "Alice A",
 *   "line1": "1 Main St",
 *   "line2": "",
 *   "city": "Seattle",
 *   "postalCode": "98101"
 * }
 */
router.post('/register', async (req, res, next) => {
  try {
    const schema = z.object({
      username: z.string().min(3),
      email: z.string().email(),
      countryCode: z.string().min(2).max(3),
      fullName: z.string().min(1),
      line1: z.string().min(1),
      line2: z.string().optional().default(''),
      city: z.string().min(1),
      postalCode: z.string().min(1)
    });

    const data = schema.parse(req.body);

    const user = await User.create({
      username: data.username.trim(),
      email: data.email.trim().toLowerCase(),
      countryCode: data.countryCode.toUpperCase()
    });

    await Address.create({
      userId: user._id,
      fullName: data.fullName,
      line1: data.line1,
      line2: data.line2 || '',
      city: data.city,
      postalCode: data.postalCode,
      countryCode: data.countryCode.toUpperCase(),
      isPrimary: true,
      validated: true
    });

    res.status(201).json({ ok: true, userId: String(user._id) });
  } catch (err) {
    // Validation errors
    if (err?.name === 'ZodError') {
      return res.status(400).json({ ok: false, error: 'Validation failed', details: err.issues });
    }
    // Duplicate key (username/email)
    if (err?.code === 11000) {
      return res.status(409).json({
        ok: false,
        error: 'User with the same username or email already exists',
        key: err.keyValue || null
      });
    }
    return next(err);
  }
});

/**
 * GET /api/users/:id/stats
 * Returns basic stats and computed max traveling slots for a user.
 */
router.get('/:id/stats', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    const s = user.stats || {};
    const stats = {
      sent: s.sent || 0,
      received: s.received || 0,
      traveling: s.traveling || 0,
      expired: s.expired || 0,
      maxSlots: computeMaxSlots(s.received || 0)
    };

    res.json({ ok: true, stats });
  } catch (err) {
    return next(err);
  }
});

export default router;
