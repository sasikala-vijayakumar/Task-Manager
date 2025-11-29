// scripts/seedUsers.js
/*
  Usage: set DATABASE_URL in .env or environment and run:
    node scripts/seedUsers.js
  Or via npm script: npm run db:seed

  This script will insert:
  - 1 admin
  - 2 teamleads (team 1 and team 2)
  - 5 employees (2 assigned to team 1, 3 assigned to team 2)
*/
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');

const users = [
  { name: 'Admin User', email: 'admin@example.com', password: 'Password123!', role: 'admin', team: null },
  { name: 'Teamlead One', email: 'lead1@example.com', password: 'Password123!', role: 'teamlead', team: 1 },
  { name: 'Teamlead Two', email: 'lead2@example.com', password: 'Password123!', role: 'teamlead', team: 2 },
  { name: 'Employee A', email: 'emp1@example.com', password: 'Password123!', role: 'employee', team: 1 },
  { name: 'Employee B', email: 'emp2@example.com', password: 'Password123!', role: 'employee', team: 1 },
  { name: 'Employee C', email: 'emp3@example.com', password: 'Password123!', role: 'employee', team: 2 },
  { name: 'Employee D', email: 'emp4@example.com', password: 'Password123!', role: 'employee', team: 2 },
  { name: 'Employee E', email: 'emp5@example.com', password: 'Password123!', role: 'employee', team: 2 }
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not set in .env or environment');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    for (const u of users) {
      // check if user exists
      const exists = await client.query('SELECT id FROM users WHERE email=$1', [u.email]);
      if (exists.rowCount > 0) {
        console.log(`Skipping existing user: ${u.email}`);
        continue;
      }
      const hashed = bcrypt.hashSync(u.password, 10);
      const res = await client.query(
        `INSERT INTO users (name, email, password, role, team) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [u.name, u.email, hashed, u.role, u.team]
      );
      console.log(`Inserted user ${u.email} (id=${res.rows[0].id})`);
    }
    console.log('Seeding complete');
  } catch (err) {
    console.error('Error while seeding users:', err);
  } finally {
    await client.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
