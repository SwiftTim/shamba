const router = require('express').Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

// Agent submits a field update
router.post('/:fieldId', authenticate, async (req, res) => {
    const { fieldId } = req.params;
    const { new_stage, notes } = req.body;

    try {
        // Agents can only update their assigned fields
        const { rows: fieldRows } = await db.query(
            'SELECT * FROM fields WHERE id = $1', [fieldId]
        );
        const field = fieldRows[0];
        if (!field) return res.status(404).json({ error: 'Field not found' });

        if (req.user.role === 'agent' && field.assigned_agent_id !== req.user.id)
            return res.status(403).json({ error: 'Not your field' });

        await db.query(
            `INSERT INTO field_updates (field_id, agent_id, previous_stage, new_stage, notes)
       VALUES ($1, $2, $3, $4, $5)`,
            [fieldId, req.user.id, field.current_stage, new_stage, notes]
        );

        const { rows } = await db.query(
            `UPDATE fields SET current_stage = $1, notes = $2, last_updated_at = NOW()
       WHERE id = $3 RETURNING *`,
            [new_stage, notes, fieldId]
        );
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get update history for a field
router.get('/:fieldId', authenticate, async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT fu.*, u.name as agent_name FROM field_updates fu
       JOIN users u ON fu.agent_id = u.id
       WHERE fu.field_id = $1 ORDER BY fu.created_at DESC`,
            [req.params.fieldId]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
