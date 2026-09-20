const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { verifyToken } = require('../auth');

router.post('/save', verifyToken, async (req, res) => {
    const { coins, bestScore, totalScore, skinId, roadId, backgroundId, nick, avatar, ringId } = req.body;
    try {
        await pool.query(`
            UPDATE progress SET
                coins = $1, best_score = $2, total_score = $3,
                skin_id = $4, road_id = $5, background_id = $6,
                nick = $7, avatar = $8, ring_id = $9
            WHERE user_id = $10
        `, [coins, bestScore, totalScore, skinId, roadId, backgroundId, nick, avatar, ringId, req.userId]);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка' });
    }
});

router.get('/load', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM progress WHERE user_id = $1', [req.userId]);
        const progress = result.rows[0];
        if (!progress) return res.status(404).json({ error: 'Не найден' });
        res.json(progress);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка' });
    }
});

router.post('/record', verifyToken, async (req, res) => {
    const { score } = req.body;
    const date = new Date().toLocaleDateString('ru-RU');
    try {
        await pool.query(
            'INSERT INTO records (user_id, score, date) VALUES ($1, $2, $3)',
            [req.userId, score, date]
        );
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка' });
    }
});

module.exports = router;