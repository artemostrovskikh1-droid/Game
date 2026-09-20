const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { hashPassword, comparePassword, createToken } = require('../auth');

// Регистрация
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

        const result = await pool.query(
            'INSERT INTO users (nick, password) VALUES ($1, $2) RETURNING id, nick',
            [nick, hashed]
        );
        const user = result.rows[0];

        await pool.query(
            'INSERT INTO progress (user_id, nick) VALUES ($1, $2)',
            [user.id, nick]
        );

        const token = createToken(user.id);
        res.json({ token, user: { id: user.id, nick: user.nick } });
    } catch (e) {
        if (e.code === '23505') { // unique violation
            return res.status(400).json({ error: 'Ник занят' });
        }
        console.error(e);
        res.status(500).json({ error: 'Ошибка' });
    }
});

// Вход
router.post('/login', async (req, res) => {
    const { nick, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE nick = $1', [nick]);
        const user = result.rows[0];
        if (!user) return res.status(401).json({ error: 'Неверный ник или пароль' });

        const valid = await comparePassword(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Неверный ник или пароль' });

        const token = createToken(user.id);
        res.json({ token, user: { id: user.id, nick: user.nick } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка' });
    }
});

module.exports = router;