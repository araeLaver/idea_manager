import { Router, Response } from 'express';
import { query, withTransaction, txQuery } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { createLogger } from '../utils/logger';

const log = createLogger('ideas');

const router = Router();

// Escape HTML entities to prevent XSS when data is rendered
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Sanitize and validate values for history JSON storage
// Limits string lengths, removes sensitive data, and escapes HTML
const sanitizeHistoryValue = (value: unknown): unknown => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    // Limit string length and escape HTML entities
    const truncated = value.length > 500 ? value.substring(0, 500) + '...' : value;
    return escapeHtml(truncated);
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    return value.slice(0, 20).map(item => {
      if (typeof item === 'string') {
        const truncated = item.length > 100 ? item.substring(0, 100) + '...' : item;
        return escapeHtml(truncated);
      }
      return item;
    });
  }
  if (typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      sanitized[k] = sanitizeHistoryValue(v);
    }
    return sanitized;
  }
  return String(value);
};

// Create safe JSON string for history storage
const createHistoryJson = (data: Record<string, unknown>): string => {
  try {
    const sanitized = sanitizeHistoryValue(data);
    return JSON.stringify(sanitized);
  } catch {
    log.warn({ data }, 'Failed to serialize history data');
    return JSON.stringify({ error: 'serialization_failed' });
  }
};

// Validation constants
const MAX_TITLE_LENGTH = 500;
const MAX_DESCRIPTION_LENGTH = 10000;
const MAX_CATEGORY_LENGTH = 100;
const MAX_TEXT_FIELD_LENGTH = 5000;
const MAX_TAGS_COUNT = 20;
const MAX_TAG_LENGTH = 50;
const VALID_STATUSES = ['draft', 'in-progress', 'completed', 'archived'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

// Validation helper
const validateIdeaInput = (body: Record<string, unknown>): { valid: boolean; error?: string } => {
  const { title, description, category, tags, status, priority, notes, targetMarket, potentialRevenue, resources, timeline, deadline, reminderEnabled, reminderDays } = body;

  if (title && (typeof title !== 'string' || title.length > MAX_TITLE_LENGTH)) {
    return { valid: false, error: `Title must be ${MAX_TITLE_LENGTH} characters or less` };
  }
  if (description && (typeof description !== 'string' || description.length > MAX_DESCRIPTION_LENGTH)) {
    return { valid: false, error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less` };
  }
  if (category && (typeof category !== 'string' || category.length > MAX_CATEGORY_LENGTH)) {
    return { valid: false, error: `Category must be ${MAX_CATEGORY_LENGTH} characters or less` };
  }
  if (tags) {
    if (!Array.isArray(tags) || tags.length > MAX_TAGS_COUNT) {
      return { valid: false, error: `Tags must be an array with max ${MAX_TAGS_COUNT} items` };
    }
    if (tags.some(tag => typeof tag !== 'string' || tag.length > MAX_TAG_LENGTH)) {
      return { valid: false, error: `Each tag must be ${MAX_TAG_LENGTH} characters or less` };
    }
  }
  if (status && !VALID_STATUSES.includes(status as string)) {
    return { valid: false, error: `Status must be one of: ${VALID_STATUSES.join(', ')}` };
  }
  if (priority && !VALID_PRIORITIES.includes(priority as string)) {
    return { valid: false, error: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}` };
  }
  // Check text field lengths
  const textFields = { notes, targetMarket, potentialRevenue, resources, timeline };
  for (const [field, value] of Object.entries(textFields)) {
    if (value && (typeof value !== 'string' || value.length > MAX_TEXT_FIELD_LENGTH)) {
      return { valid: false, error: `${field} must be ${MAX_TEXT_FIELD_LENGTH} characters or less` };
    }
  }
  // Validate deadline format (YYYY-MM-DD)
  if (deadline && typeof deadline === 'string' && deadline !== '') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(deadline)) {
      return { valid: false, error: 'Deadline must be in YYYY-MM-DD format' };
    }
  }
  // Validate reminderEnabled
  if (reminderEnabled !== undefined && typeof reminderEnabled !== 'boolean') {
    return { valid: false, error: 'reminderEnabled must be a boolean' };
  }
  // Validate reminderDays
  if (reminderDays !== undefined) {
    if (typeof reminderDays !== 'number' || reminderDays < 1 || reminderDays > 30) {
      return { valid: false, error: 'reminderDays must be a number between 1 and 30' };
    }
  }
  return { valid: true };
};

// Apply auth middleware to all routes
router.use(authMiddleware);

// Helper function to map database row to idea object
interface DbRow {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: string;
  priority: string;
  notes: string;
  target_market: string;
  potential_revenue: string;
  resources: string;
  timeline: string;
  deadline: string | null;
  reminder_enabled: boolean;
  reminder_days: number;
  created_at: string;
  updated_at: string;
}

const mapRowToIdea = (row: DbRow) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  tags: row.tags || [],
  status: row.status,
  priority: row.priority,
  notes: row.notes,
  targetMarket: row.target_market,
  potentialRevenue: row.potential_revenue,
  resources: row.resources,
  timeline: row.timeline,
  deadline: row.deadline,
  reminderEnabled: row.reminder_enabled,
  reminderDays: row.reminder_days,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

// Get all ideas for user with pagination
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, priority, search, page, limit, sortBy, sortOrder } = req.query;

    // Pagination settings
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    // Sorting settings
    const allowedSortFields = ['created_at', 'updated_at', 'title', 'status', 'priority'];
    const sortField = allowedSortFields.includes(sortBy as string) ? sortBy : 'created_at';
    const sortDirection = (sortOrder as string)?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    let whereClause = 'WHERE user_id = $1';
    const params: unknown[] = [req.userId];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (priority) {
      whereClause += ` AND priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (
        title ILIKE $${paramIndex} OR
        description ILIKE $${paramIndex} OR
        $${paramIndex + 1} = ANY(tags)
      )`;
      params.push(`%${search}%`, search);
      paramIndex += 2;
    }

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) as total FROM idea_manager.ideas ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get paginated data
    const dataParams = [...params, limitNum, offset];
    const result = await query(
      `SELECT * FROM idea_manager.ideas
       ${whereClause}
       ORDER BY ${sortField} ${sortDirection}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      dataParams
    );

    const ideas = result.rows.map(mapRowToIdea);

    res.json({
      data: ideas,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    log.error({ error }, 'Get ideas error');
    res.status(500).json({ error: 'Failed to get ideas' });
  }
});

// Get single idea
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM idea_manager.ideas WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    res.json(mapRowToIdea(result.rows[0]));
  } catch (error) {
    log.error({ error, ideaId: req.params.id }, 'Get idea error');
    res.status(500).json({ error: 'Failed to get idea' });
  }
});

// Create idea
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      status,
      priority,
      notes,
      targetMarket,
      potentialRevenue,
      resources,
      timeline,
      deadline,
      reminderEnabled,
      reminderDays
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Validate input
    const validation = validateIdeaInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const result = await query(
      `INSERT INTO idea_manager.ideas (
        user_id, title, description, category, tags, status, priority,
        notes, target_market, potential_revenue, resources, timeline,
        deadline, reminder_enabled, reminder_days
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        req.userId,
        title,
        description || '',
        category || '',
        tags || [],
        status || 'draft',
        priority || 'medium',
        notes || '',
        targetMarket || '',
        potentialRevenue || '',
        resources || '',
        timeline || '',
        deadline || null,
        reminderEnabled || false,
        reminderDays || 3
      ]
    );

    const row = result.rows[0];

    // Record history
    await query(
      `INSERT INTO idea_manager.idea_history (idea_id, user_id, action, new_values)
       VALUES ($1, $2, 'created', $3)`,
      [row.id, req.userId, createHistoryJson({ title, status: status || 'draft' })]
    );

    res.status(201).json(mapRowToIdea(row));
  } catch (error) {
    log.error({ error }, 'Create idea error');
    res.status(500).json({ error: 'Failed to create idea' });
  }
});

// Update idea with transaction
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      status,
      priority,
      notes,
      targetMarket,
      potentialRevenue,
      resources,
      timeline,
      deadline,
      reminderEnabled,
      reminderDays
    } = req.body;

    // Validate input
    const validation = validateIdeaInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const updatedIdea = await withTransaction(async (client) => {
      // Get old values for history
      const oldResult = await txQuery(
        client,
        'SELECT * FROM idea_manager.ideas WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [req.params.id, req.userId]
      );

      if (oldResult.rows.length === 0) {
        throw { status: 404, message: 'Idea not found' };
      }

      const oldRow = oldResult.rows[0];

      const result = await txQuery(
        client,
        `UPDATE idea_manager.ideas SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          category = COALESCE($3, category),
          tags = COALESCE($4, tags),
          status = COALESCE($5, status),
          priority = COALESCE($6, priority),
          notes = COALESCE($7, notes),
          target_market = COALESCE($8, target_market),
          potential_revenue = COALESCE($9, potential_revenue),
          resources = COALESCE($10, resources),
          timeline = COALESCE($11, timeline),
          deadline = COALESCE($12, deadline),
          reminder_enabled = COALESCE($13, reminder_enabled),
          reminder_days = COALESCE($14, reminder_days)
        WHERE id = $15 AND user_id = $16
        RETURNING *`,
        [
          title,
          description,
          category,
          tags,
          status,
          priority,
          notes,
          targetMarket,
          potentialRevenue,
          resources,
          timeline,
          deadline,
          reminderEnabled,
          reminderDays,
          req.params.id,
          req.userId
        ]
      );

      const row = result.rows[0];

      // Record history
      const action = status && status !== oldRow.status ? 'status_changed' : 'updated';
      await txQuery(
        client,
        `INSERT INTO idea_manager.idea_history (idea_id, user_id, action, old_values, new_values)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          row.id,
          req.userId,
          action,
          createHistoryJson({ title: oldRow.title, status: oldRow.status }),
          createHistoryJson({ title: row.title, status: row.status })
        ]
      );

      return mapRowToIdea(row);
    });

    res.json(updatedIdea);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    log.error({ error, ideaId: req.params.id }, 'Update idea error');
    res.status(500).json({ error: 'Failed to update idea' });
  }
});

// Delete idea with transaction
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await withTransaction(async (client) => {
      // Get idea info for history
      const ideaResult = await txQuery(
        client,
        'SELECT title, status FROM idea_manager.ideas WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [req.params.id, req.userId]
      );

      if (ideaResult.rows.length === 0) {
        throw { status: 404, message: 'Idea not found' };
      }

      // Record history before deletion (history will be cascade deleted, but we log it first)
      await txQuery(
        client,
        `INSERT INTO idea_manager.idea_history (idea_id, user_id, action, old_values)
         VALUES ($1, $2, 'deleted', $3)`,
        [req.params.id, req.userId, createHistoryJson(ideaResult.rows[0])]
      );

      await txQuery(
        client,
        'DELETE FROM idea_manager.ideas WHERE id = $1 AND user_id = $2',
        [req.params.id, req.userId]
      );
    });

    res.json({ message: 'Idea deleted successfully' });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    log.error({ error, ideaId: req.params.id }, 'Delete idea error');
    res.status(500).json({ error: 'Failed to delete idea' });
  }
});

// Get statistics - optimized single query with CTEs
router.get('/stats/summary', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `WITH user_ideas AS (
        SELECT * FROM idea_manager.ideas WHERE user_id = $1
      ),
      stats AS (
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress,
          COUNT(*) FILTER (WHERE status = 'draft') as draft,
          COUNT(*) FILTER (WHERE status = 'archived') as archived,
          COUNT(*) FILTER (WHERE priority = 'high') as high_priority
        FROM user_ideas
      ),
      top_categories AS (
        SELECT category, COUNT(*) as count
        FROM user_ideas
        WHERE category IS NOT NULL AND category != ''
        GROUP BY category
        ORDER BY count DESC
        LIMIT 5
      ),
      top_tags AS (
        SELECT unnest(tags) as tag, COUNT(*) as count
        FROM user_ideas
        GROUP BY tag
        ORDER BY count DESC
        LIMIT 10
      )
      SELECT
        (SELECT row_to_json(stats) FROM stats) as stats,
        (SELECT COALESCE(json_agg(row_to_json(top_categories)), '[]'::json) FROM top_categories) as top_categories,
        (SELECT COALESCE(json_agg(row_to_json(top_tags)), '[]'::json) FROM top_tags) as top_tags`,
      [req.userId]
    );

    const { stats, top_categories, top_tags } = result.rows[0];

    res.json({
      total: parseInt(stats.total, 10),
      completed: parseInt(stats.completed, 10),
      inProgress: parseInt(stats.in_progress, 10),
      draft: parseInt(stats.draft, 10),
      archived: parseInt(stats.archived, 10),
      highPriority: parseInt(stats.high_priority, 10),
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      topCategories: top_categories.map((r: { category: string; count: string }) => ({ category: r.category, count: parseInt(r.count, 10) })),
      topTags: top_tags.map((r: { tag: string; count: string }) => ({ tag: r.tag, count: parseInt(r.count, 10) }))
    });
  } catch (error) {
    log.error({ error }, 'Get stats error');
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Bulk update status (for kanban)
const MAX_BULK_IDS = 100;

router.patch('/bulk/status', async (req: AuthRequest, res: Response) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || !status) {
      return res.status(400).json({ error: 'ids array and status are required' });
    }

    // Limit bulk operations to prevent abuse
    if (ids.length > MAX_BULK_IDS) {
      return res.status(400).json({ error: `Maximum ${MAX_BULK_IDS} items allowed per bulk operation` });
    }

    await query(
      `UPDATE idea_manager.ideas
       SET status = $1
       WHERE id = ANY($2) AND user_id = $3`,
      [status, ids, req.userId]
    );

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    log.error({ error }, 'Bulk update error');
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
