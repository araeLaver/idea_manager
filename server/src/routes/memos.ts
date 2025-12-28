import { Router, Response } from 'express';
import { query } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { createLogger } from '../utils/logger';

const log = createLogger('memos');
const router = Router();

// Validation constants
const MAX_CONTENT_LENGTH = 65535;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Validation helper functions
const isValidMonth = (month: unknown): boolean => {
  const m = parseInt(month as string);
  return !isNaN(m) && m >= 1 && m <= 12;
};

const isValidYear = (year: unknown): boolean => {
  const y = parseInt(year as string);
  return !isNaN(y) && y >= 2000 && y <= 2100;
};

const isValidDate = (date: string): boolean => {
  if (!DATE_REGEX.test(date)) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
};

router.use(authMiddleware);

// Get all memos for user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.query;

    let sql = 'SELECT * FROM idea_manager.daily_memos WHERE user_id = $1';
    const params: unknown[] = [req.userId];

    if (month && year) {
      // Validate month and year
      if (!isValidMonth(month) || !isValidYear(year)) {
        return res.status(400).json({ error: 'Invalid month or year parameter' });
      }
      sql += ' AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3';
      params.push(parseInt(month as string), parseInt(year as string));
    }

    sql += ' ORDER BY date DESC';

    const result = await query(sql, params);

    const memos = result.rows.map(row => ({
      id: row.id,
      date: row.date,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({ data: memos });
  } catch (error) {
    log.error({ error }, 'Get memos error');
    res.status(500).json({ error: 'Failed to get memos' });
  }
});

// Get memo by date
router.get('/date/:date', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM idea_manager.daily_memos WHERE user_id = $1 AND date = $2',
      [req.userId, req.params.date]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      date: row.date,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  } catch (error) {
    log.error({ error, date: req.params.date }, 'Get memo by date error');
    res.status(500).json({ error: 'Failed to get memo' });
  }
});

// Create or update memo
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { date, content } = req.body;

    if (!date || !content) {
      return res.status(400).json({ error: 'Date and content are required' });
    }

    // Validate date format
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Validate content length
    if (content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({ error: `Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters` });
    }

    // Upsert memo
    const result = await query(
      `INSERT INTO idea_manager.daily_memos (user_id, date, content)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, date)
       DO UPDATE SET content = $3
       RETURNING *`,
      [req.userId, date, content]
    );

    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      date: row.date,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  } catch (error) {
    log.error({ error }, 'Create memo error');
    res.status(500).json({ error: 'Failed to save memo' });
  }
});

// Delete memo
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'DELETE FROM idea_manager.daily_memos WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memo not found' });
    }

    res.json({ message: 'Memo deleted successfully' });
  } catch (error) {
    log.error({ error, memoId: req.params.id }, 'Delete memo error');
    res.status(500).json({ error: 'Failed to delete memo' });
  }
});

// Delete memo by date
router.delete('/date/:date', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'DELETE FROM idea_manager.daily_memos WHERE date = $1 AND user_id = $2 RETURNING id',
      [req.params.date, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Memo not found' });
    }

    res.json({ message: 'Memo deleted successfully' });
  } catch (error) {
    log.error({ error, date: req.params.date }, 'Delete memo by date error');
    res.status(500).json({ error: 'Failed to delete memo' });
  }
});

export default router;
