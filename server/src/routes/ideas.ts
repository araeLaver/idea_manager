import { Router, Response } from 'express';
import { query } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

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
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

// Get all ideas for user with pagination
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, priority, search, page, limit, sortBy, sortOrder } = req.query;

    // Pagination settings
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
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
    const total = parseInt(countResult.rows[0].total);

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
    console.error('Get ideas error:', error);
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
    console.error('Get idea error:', error);
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
      timeline
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await query(
      `INSERT INTO idea_manager.ideas (
        user_id, title, description, category, tags, status, priority,
        notes, target_market, potential_revenue, resources, timeline
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
        timeline || ''
      ]
    );

    const row = result.rows[0];

    // Record history
    await query(
      `INSERT INTO idea_manager.idea_history (idea_id, user_id, action, new_values)
       VALUES ($1, $2, 'created', $3)`,
      [row.id, req.userId, JSON.stringify({ title, status: status || 'draft' })]
    );

    res.status(201).json(mapRowToIdea(row));
  } catch (error) {
    console.error('Create idea error:', error);
    res.status(500).json({ error: 'Failed to create idea' });
  }
});

// Update idea
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
      timeline
    } = req.body;

    // Get old values for history
    const oldResult = await query(
      'SELECT * FROM idea_manager.ideas WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    const oldRow = oldResult.rows[0];

    const result = await query(
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
        timeline = COALESCE($11, timeline)
      WHERE id = $12 AND user_id = $13
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
        req.params.id,
        req.userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    const row = result.rows[0];

    // Record history
    const action = status && status !== oldRow.status ? 'status_changed' : 'updated';
    await query(
      `INSERT INTO idea_manager.idea_history (idea_id, user_id, action, old_values, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        row.id,
        req.userId,
        action,
        JSON.stringify({ title: oldRow.title, status: oldRow.status }),
        JSON.stringify({ title: row.title, status: row.status })
      ]
    );

    res.json(mapRowToIdea(row));
  } catch (error) {
    console.error('Update idea error:', error);
    res.status(500).json({ error: 'Failed to update idea' });
  }
});

// Delete idea
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // Get idea info for history
    const ideaResult = await query(
      'SELECT title, status FROM idea_manager.ideas WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (ideaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    // Record history before deletion
    await query(
      `INSERT INTO idea_manager.idea_history (idea_id, user_id, action, old_values)
       VALUES ($1, $2, 'deleted', $3)`,
      [req.params.id, req.userId, JSON.stringify(ideaResult.rows[0])]
    );

    const result = await query(
      'DELETE FROM idea_manager.ideas WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    res.json({ message: 'Idea deleted successfully' });
  } catch (error) {
    console.error('Delete idea error:', error);
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
      total: parseInt(stats.total),
      completed: parseInt(stats.completed),
      inProgress: parseInt(stats.in_progress),
      draft: parseInt(stats.draft),
      archived: parseInt(stats.archived),
      highPriority: parseInt(stats.high_priority),
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      topCategories: top_categories.map((r: { category: string; count: string }) => ({ category: r.category, count: parseInt(r.count) })),
      topTags: top_tags.map((r: { tag: string; count: string }) => ({ tag: r.tag, count: parseInt(r.count) }))
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Bulk update status (for kanban)
router.patch('/bulk/status', async (req: AuthRequest, res: Response) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || !status) {
      return res.status(400).json({ error: 'ids array and status are required' });
    }

    await query(
      `UPDATE idea_manager.ideas
       SET status = $1
       WHERE id = ANY($2) AND user_id = $3`,
      [status, ids, req.userId]
    );

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
