import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

export const db = drizzle(client);
