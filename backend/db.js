const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

// Convenience wrapper: await query(sql, [params])
async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

// Backward-compat: routes call getDB() but now use the pool via query()
function getDB() {
  return pool;
}

async function initDB() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.pg.sql'), 'utf8');
  await pool.query(schema);
  console.log('✅ PostgreSQL database initialized successfully');
}

module.exports = { pool, query, getDB, initDB };
