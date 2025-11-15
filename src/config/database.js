import dotenv from "dotenv";

// Load environment variables. In tests, Jest sets NODE_ENV="test" so we
// still load .env but avoid making a real database connection.
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env" });

import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

let db;

if (process.env.NODE_ENV === "test") {
  // During tests we don't want to connect to a real database. Export a
  // proxy object that will throw if any code accidentally tries to use
  // the database, so tests can explicitly mock it if needed.
  db = new Proxy(
    {},
    {
      get() {
        throw new Error(
          "Database access attempted in test environment. " +
            "Mock #config/database.js or provide a test database URL."
        );
      },
    }
  );
} else {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  db = drizzle(client);
}

export { db };
