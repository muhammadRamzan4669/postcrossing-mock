import express from 'express';
import { z } from 'zod';
import {
  requestAddressToSend,
  registerReceived,
  listTraveling,
  getStats
} from '../services/postcrossingService.js';

export const router = express.Router();

/**
 * POST /api/postcards/request
 * Requires: x-user-id header identifying the sender userId.
 * Response: { ok: true, postcard } or { ok: false, error }
 */
router.post('/request', async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ ok: false, error: 'Missing x-user-id header' });
    }

    const result = await requestAddressToSend(userId);
    if (!result?.ok) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/postcards/register-received
 * Body: { code: "US-12345" }
 * Response: { ok: true, postcard } or { ok: false, error }
 */
router.post('/register-received', async (req, res, next) => {
  try {
    const schema = z.object({ code: z.string().min(3) });
    const { code } = schema.parse(req.body);

    const result = await registerReceived(code, req.userId || null);
    if (!result?.ok) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    if (err?.name === 'ZodError') {
      return res.status(400).json({ ok: false, error: 'Validation failed', details: err.issues });
    }
    return next(err);
  }
});

/**
 * GET /api/postcards/traveling
 * Requires: x-user-id header
 * Response: { ok: true, items: Postcard[] }
 */
router.get('/traveling', async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ ok: false, error: 'Missing x-user-id header' });
    }

    const items = await listTraveling(userId);
    return res.json({ ok: true, items });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/postcards/stats
 * Requires: x-user-id header
 * Response: { ok: true, stats } where stats contains computed maxSlots etc.
 */
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ ok: false, error: 'Missing x-user-id header' });
    }

    const stats = await getStats(userId);
    return res.json({ ok: true, stats });
  } catch (err) {
    return next(err);
  }
});

export default router;
