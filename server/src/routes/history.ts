import { Router, Response } from 'express';
import { query } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// Get all history for user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await query(
      `SELECT h.*, i.title as idea_title
       FROM idea_manager.idea_history h
       LEFT JOIN idea_manager.ideas i ON h.idea_id = i.id
       WHERE h.user_id = $1
       ORDER BY h.changed_at DESC
       LIMIT $2 OFFSET $3`,
      [req.userId, limit, offset]
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

    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
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

    res.json(history);
  } catch (error) {
    console.error('Get idea history error:', error);
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

    res.json(result.rows.map(row => ({
      date: row.date,
      action: row.action,
      count: parseInt(row.count)
    })));
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ error: 'Failed to get recent activity' });
  }
});

export default router;
