import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL ?? "");

await sql`CREATE TABLE IF NOT EXISTS "Waitlist" (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);`;
