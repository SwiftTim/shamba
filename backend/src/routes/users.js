const bcrypt = require('bcrypt');
const router = require('express').Router();
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// Get all agents (Admin only)
router.get('/agents', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const { rows } = await db.query(
            "SELECT id, name, email, created_at FROM users WHERE role = 'agent' ORDER BY name ASC"
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new agent (Admin only)
router.post('/agents', authenticate, requireRole('admin'), async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const password_hash = await bcrypt.hash(password || 'agent123', 10);
        const { rows } = await db.query(
            `INSERT INTO users (name, email, password_hash, role) 
             VALUES ($1, $2, $3, 'agent') RETURNING id, name, email`,
            [name, email, password_hash]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ error: 'Email already exists' });
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
