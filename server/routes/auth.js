const express = require('express');
const router = express.Router();
const db = require('../db');
const { hashPassword, comparePassword, createToken } = require('../auth');

router.post('/register', async (req, res) => {
    const { nick, password } = req.body;
    if (!nick || nick.length < 2 || nick.length > 16) {
        return res.status(400).json({ error: 'Ник 2-16 символов' });
    }
    if (!password || password.length < 4) {
        return res.status(400).json({ error: 'Пароль минимум 4' });
    }
    try {
        const hashed = await hashPassword(password);
        db.run('INSERT INTO users (nick, password) VALUES (?, ?)', [nick, hashed], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Ник занят' });
                }
                return res.status(500).json({ error: 'Ошибка' });
            }
            db.run('INSERT INTO progress (user_id, nick) VALUES (?, ?)', [this.lastID, nick]);
            const token = createToken(this.lastID);
            res.json({ token, user: { id: this.lastID, nick } });
        });
    } catch (e) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

router.post('/login', (req, res) => {
    const { nick, password } = req.body;
    db.get('SELECT * FROM users WHERE nick = ?', [nick], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Неверный ник или пароль' });
        }
        const valid = await comparePassword(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Неверный ник или пароль' });
        }
        const token = createToken(user.id);
        res.json({ token, user: { id: user.id, nick: user.nick } });
    });
});

module.exports = router;
