const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/rating', (req, res) => {
    db.all('SELECT u.nick, p.coins, p.best_score, p.total_score, p.avatar FROM progress p JOIN users u ON u.id = p.user_id ORDER BY p.total_score DESC LIMIT 50',
    (err, rows) => {
        if (err) return res.status(500).json({ error: 'Ошибка' });
        res.json(rows);
    });
});

module.exports = router;
