import express from 'express';

export const router = express.Router();

/**
 * GET /api/meta/health
 * Lightweight healthcheck endpoint.
 * Returns:
 * {
 *   ok: true,
 *   ts: "2025-01-01T00:00:00.000Z",
 *   service: "postcrossing-mock",
 *   env: "development"
 * }
 */
router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    ts: new Date().toISOString(),
    service: 'postcrossing-mock',
    env: process.env.NODE_ENV || 'development'
  });
});

export default router;
