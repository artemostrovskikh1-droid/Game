const { Pool } = require('pg');

// Render даёт переменную DATABASE_URL для подключения к PostgreSQL.
// Локально можно задать в .env: DATABASE_URL=postgres://...
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')
        ? { rejectUnauthorized: false }
        : false
});

// Инициализация таблиц при старте
async function initDatabase() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                nick TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS progress (
                user_id INTEGER PRIMARY KEY REFERENCES users(id),
                coins INTEGER DEFAULT 0,
                best_score INTEGER DEFAULT 0,
                total_score INTEGER DEFAULT 0,
                skin_id TEXT DEFAULT 'default',
                road_id TEXT DEFAULT 'asphalt',
                background_id TEXT DEFAULT 'reality',
                nick TEXT DEFAULT '',
                avatar TEXT DEFAULT '🚗',
                ring_id TEXT DEFAULT 'none'
            )
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS records (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                score INTEGER NOT NULL,
                date TEXT NOT NULL
            )
        `);
        console.log('✓ Таблицы готовы (PostgreSQL)');
    } finally {
        client.release();
    }
}

module.exports = { pool, initDatabase };