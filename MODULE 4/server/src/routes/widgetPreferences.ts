import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  getPreferences,
  setPreference,
  resetAllPreferences,
} from '../services/developerWidgetPreferences';

const router = Router();

// GET /widget-preferences - Get current developer's personal widget preferences
router.get(
  '/',
  requireAuth,
  requireRole('admin', 'developer'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const developerId = req.user?.id;
      if (!developerId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const preferences = await getPreferences(developerId);
      res.status(200).json({ preferences });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch widget preferences';
      res.status(500).json({ error: 'Internal server error', message });
    }
  }
);

// PUT /widget-preferences/:widgetKey - Set single widget visibility for calling developer
router.put(
  '/:widgetKey',
  requireAuth,
  requireRole('admin', 'developer'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const developerId = req.user?.id;
      if (!developerId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { widgetKey } = req.params;
      const { visible } = req.body;

      if (!widgetKey || typeof widgetKey !== 'string') {
        res.status(400).json({ error: 'widgetKey parameter is required' });
        return;
      }

      if (typeof visible !== 'boolean') {
        res.status(400).json({ error: 'visible must be a boolean value' });
        return;
      }

      await setPreference(developerId, widgetKey.trim(), visible);
      res.status(200).json({ success: true, message: 'Widget preference updated successfully' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update widget preference';
      res.status(500).json({ error: 'Internal server error', message });
    }
  }
);

// POST /widget-preferences/reset - Reset all preferences for calling developer (revert to default-visible)
router.post(
  '/reset',
  requireAuth,
  requireRole('admin', 'developer'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const developerId = req.user?.id;
      if (!developerId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await resetAllPreferences(developerId);
      res.status(200).json({ success: true, message: 'All widget preferences reset successfully' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reset widget preferences';
      res.status(500).json({ error: 'Internal server error', message });
    }
  }
);

export default router;
