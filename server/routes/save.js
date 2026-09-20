const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../auth');

router.post('/save', verifyToken, (req, res) => {
    const { coins, bestScore, totalScore, skinId, roadId, backgroundId, nick, avatar, ringId } = req.body;
    db.run('UPDATE progress SET coins=?, best_score=?, total_score=?, skin_id=?, road_id=?, background_id=?, nick=?, avatar=?, ring_id=? WHERE user_id=?',
    [coins, bestScore, totalScore, skinId, roadId, backgroundId, nick, avatar, ringId, req.userId],
    function(err) {
        if (err) return res.status(500).json({ error: 'Ошибка' });
        res.json({ success: true });
    });
});

router.get('/load', verifyToken, (req, res) => {
    db.get('SELECT * FROM progress WHERE user_id = ?', [req.userId], (err, progress) => {
        if (err || !progress) return res.status(404).json({ error: 'Не найден' });
        res.json(progress);
    });
});

router.post('/record', verifyToken, (req, res) => {
    const { score } = req.body;
    const date = new Date().toLocaleDateString('ru-RU');
    db.run('INSERT INTO records (user_id, score, date) VALUES (?, ?, ?)', [req.userId, score, date],
    function(err) {
        if (err) return res.status(500).json({ error: 'Ошибка' });
        res.json({ success: true });
    });
});

module.exports = router;
