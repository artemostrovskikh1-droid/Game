const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'ortacar.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Ошибка открытия БД:', err);
    } else {
        console.log('✓ SQLite подключён:', dbPath);
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nick TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('❌ users:', err);
        else console.log('✓ Таблица users готова');
    });

    db.run(`CREATE TABLE IF NOT EXISTS progress (
        user_id INTEGER PRIMARY KEY,
        coins INTEGER DEFAULT 0,
        best_score INTEGER DEFAULT 0,
        total_score INTEGER DEFAULT 0,
        skin_id TEXT DEFAULT 'default',
        road_id TEXT DEFAULT 'asphalt',
        background_id TEXT DEFAULT 'reality',
        nick TEXT DEFAULT '',
        avatar TEXT DEFAULT '🚗',
        ring_id TEXT DEFAULT 'none',
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error('❌ progress:', err);
        else console.log('✓ Таблица progress готова');
    });

    db.run(`CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) console.error('❌ records:', err);
        else console.log('✓ Таблица records готова');
    });
});

module.exports = db;
