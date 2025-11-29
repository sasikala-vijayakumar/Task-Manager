# Database setup — Task Manager

This folder contains the SQL schema for the app.

Steps to create tables (PowerShell / Windows):

1. Ensure Postgres is running and you have a connection string (DATABASE_URL). Example:

   postgres://postgres:yourpassword@localhost:5432/taskdb

2. Create the database (if not already created):

   psql -U postgres -c "CREATE DATABASE taskdb;"


3. Run the schema SQL

Option A — using the included Node script (recommended; uses `DATABASE_URL` from `.env`):

   cd ..\backend
   # ensure you have a .env file with DATABASE_URL set (see .env.example)
   npm run db:schema

Option B — using psql directly:

   psql "postgres://postgres:yourpassword@localhost:5432/taskdb" -f schema.sql

   Or if you have `PGUSER`/`PGPASSWORD` env vars set and `psql` default to localhost:

   psql -d taskdb -f schema.sql

4. Start the backend and register the first user using the API endpoint:

   - Start server: from `backend` folder run `node src/index.js` (or `npm start` if you have a start script).
   - Register a user: POST `/api/auth/register` with JSON body `{ "name": "Admin","email":"admin@example.com","password":"secret","role":"admin" }`.

Notes:
- Passwords must be created via the register endpoint which hashes passwords with bcrypt. Avoid inserting plaintext passwords manually.
- If you want to seed an admin via SQL, compute a bcrypt hash in Node or another tool and use that hash in the `password` column.
