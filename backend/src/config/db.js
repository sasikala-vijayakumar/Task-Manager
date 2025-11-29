// src/config/db.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('connect', () => console.log('Postgres connected'));
module.exports = pool;
