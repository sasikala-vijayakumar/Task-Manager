// scripts/runSchema.js
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Client } = require('pg');

async function run() {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.error('DATABASE_URL not set in environment or .env');
      process.exit(1);
    }

    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error('schema.sql not found at', schemaPath);
      process.exit(1);
    }

    const sql = fs.readFileSync(schemaPath, 'utf8');
    // Split statements by semicolon followed by optional whitespace and newline/end
    const statements = sql
      .split(/;\s*(?=\r?\n|$)/)
      .map(s => s.trim())
      .filter(Boolean);

    const client = new Client({ connectionString });
    await client.connect();

    for (const stmt of statements) {
      console.log('Executing statement...');
      await client.query(stmt);
    }

    await client.end();
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Error applying schema:', err.message || err);
    process.exit(1);
  }
}

run();
