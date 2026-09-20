// ============================================================
// ORTACAR · Сервер · v1.0
// ============================================================
const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();
const { initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());

// Простой логгер запросов (чтобы видеть в консоли, что происходит)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ============================================================
// API-МАРШРУТЫ
// ============================================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/save'));
app.use('/api', require('./routes/rating'));

// Проверка работы сервера (health-check)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        version: '1.0.0',
        time: new Date().toISOString()
    });
});

// ============================================================
// СТАТИКА (клиентская игра)
// ============================================================
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// Fallback: любой неизвестный GET → отдать ortacar.html
app.use((req, res) => {
    const htmlPath = path.join(clientPath, 'ortacar.html');
    res.sendFile(htmlPath, (err) => {
        if (err) {
            res.status(404).send(`
                <h1>ORTACAR Server работает!</h1>
                <p>Но файл <code>client/ortacar.html</code> не найден.</p>
                <p>Положи свою игру в папку <code>client/</code> под именем <code>ortacar.html</code>.</p>
            `);
        }
    });
});

// ============================================================
// ОБРАБОТКА ОШИБОК
// ============================================================
app.use((err, req, res, next) => {
    console.error('❌ Ошибка сервера:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// ============================================================
// ЗАПУСК
// ============================================================
    initDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log('');
            console.log('========================================');
            console.log('  🎮 ORTACAR Server запущен');
            console.log('========================================');
            console.log(`  🌐 http://localhost:${PORT}`);
            console.log(`  📁 Статика: ${clientPath}`);
            console.log(`  🔐 JWT_SECRET: ${process.env.JWT_SECRET ? 'установлен ✓' : 'НЕ УСТАНОВЛЕН ✗'}`);
            console.log(`  🗄️  БД: PostgreSQL`);
            console.log('========================================');
            console.log('');
        });
    })
    .catch((err) => {
        console.error('❌ Ошибка инициализации БД:', err);
        process.exit(1);
    });
