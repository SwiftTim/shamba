const router = require('express').Router();
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { getFieldStatus } = require('../services/statusEngine');

// Get fields (Admin: all, Agent: assigned)
router.get('/', authenticate, async (req, res) => {
    try {
        const query = req.user.role === 'admin'
            ? 'SELECT f.*, u.name as agent_name FROM fields f LEFT JOIN users u ON f.assigned_agent_id = u.id ORDER BY f.created_at DESC'
            : 'SELECT f.*, u.name as agent_name FROM fields f LEFT JOIN users u ON f.assigned_agent_id = u.id WHERE f.assigned_agent_id = $1 ORDER BY f.created_at DESC';

        const params = req.user.role === 'admin' ? [] : [req.user.id];
        const { rows } = await db.query(query, params);

        const fields = rows.map(f => ({ ...f, status: getFieldStatus(f) }));
        res.json(fields);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin: create field
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
    const { name, crop_type, planting_date, assigned_agent_id } = req.body;
    try {
        const { rows } = await db.query(
            `INSERT INTO fields (name, crop_type, planting_date, assigned_agent_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, crop_type, planting_date, assigned_agent_id || null]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin: assign agent
router.patch('/:id/assign', authenticate, requireRole('admin'), async (req, res) => {
    const { agent_id } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE fields SET assigned_agent_id = $1 WHERE id = $2 RETURNING *',
            [agent_id, req.params.id]
        );
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
