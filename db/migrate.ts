import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function main() {
  console.log("Migration started");
  console.log("Database URL:", process.env.DATABASE_URL); // Log the DATABASE_URL (make sure to remove this in production)

  const migrationsFolder = path.join(process.cwd(), 'drizzle');
  const metaFolder = path.join(migrationsFolder, 'meta');
  const journalPath = path.join(metaFolder, '_journal.json');

  if (!fs.existsSync(metaFolder)) {
    fs.mkdirSync(metaFolder, { recursive: true });
  }

  if (!fs.existsSync(journalPath)) {
    fs.writeFileSync(journalPath, JSON.stringify({ entries: [] }));
  }

  try {
    await pool.connect(); // Test the connection
    console.log("Successfully connected to the database");
    await migrate(db, { migrationsFolder });
    console.log("Migration completed");
  } catch (error) {
    console.error("Error details:", error);
  } finally {
    await pool.end(); // Close the pool
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed");
  console.error(err);
  process.exit(1);
});