import { Router, Response } from 'express';
import { query } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { createLogger } from '../utils/logger';

const log = createLogger('history');
const router = Router();

// Validation constants
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;
const DEFAULT_OFFSET = 0;

router.use(authMiddleware);

// Get all history for user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    // Parse and validate pagination parameters
    const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit as string, 10) || DEFAULT_LIMIT));
    const offsetNum = Math.max(0, parseInt(req.query.offset as string, 10) || DEFAULT_OFFSET);

    const result = await query(
      `SELECT h.*, i.title as idea_title
       FROM idea_manager.idea_history h
       LEFT JOIN idea_manager.ideas i ON h.idea_id = i.id
       WHERE h.user_id = $1
       ORDER BY h.changed_at DESC
       LIMIT $2 OFFSET $3`,
      [req.userId, limitNum, offsetNum]
    );

    const history = result.rows.map(row => ({
      id: row.id,
      ideaId: row.idea_id,
      ideaTitle: row.idea_title,
      action: row.action,
      oldValues: row.old_values,
      newValues: row.new_values,
      changedAt: row.changed_at
    }));

    res.json({ data: history });
  } catch (error) {
    log.error({ error }, 'Get history error');
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// Get history for specific idea
router.get('/idea/:ideaId', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM idea_manager.idea_history
       WHERE idea_id = $1 AND user_id = $2
       ORDER BY changed_at DESC`,
      [req.params.ideaId, req.userId]
    );

    const history = result.rows.map(row => ({
      id: row.id,
      ideaId: row.idea_id,
      action: row.action,
      oldValues: row.old_values,
      newValues: row.new_values,
      changedAt: row.changed_at
    }));

    res.json({ data: history });
  } catch (error) {
    log.error({ error, ideaId: req.params.ideaId }, 'Get idea history error');
    res.status(500).json({ error: 'Failed to get idea history' });
  }
});

// Get recent activity summary
router.get('/recent', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT
        DATE(changed_at) as date,
        action,
        COUNT(*) as count
       FROM idea_manager.idea_history
       WHERE user_id = $1 AND changed_at > NOW() - INTERVAL '30 days'
       GROUP BY DATE(changed_at), action
       ORDER BY date DESC`,
      [req.userId]
    );

    res.json({
      data: result.rows.map(row => ({
        date: row.date,
        action: row.action,
        count: parseInt(row.count, 10)
      }))
    });
  } catch (error) {
    log.error({ error }, 'Get recent activity error');
    res.status(500).json({ error: 'Failed to get recent activity' });
  }
});

export default router;
