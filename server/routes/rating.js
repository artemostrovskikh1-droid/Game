const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/rating', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.nick, p.coins, p.best_score, p.total_score, p.avatar
            FROM progress p
            JOIN users u ON u.id = p.user_id
            ORDER BY p.total_score DESC
            LIMIT 50
        `);
        res.json(result.rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка' });
    }
});

module.exports = router;