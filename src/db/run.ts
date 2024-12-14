import { Umzug } from "npm:umzug";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { ensureDirSync } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";

const MIGRATIONS_DIR = "./src/db/migrations";
ensureDirSync(MIGRATIONS_DIR);

console.log("🚀 Setting up SQLite database...");
const db = new DB("app.db");

class SQLiteStorage {
  constructor(private db: DB) {}

  // deno-lint-ignore require-await
  async logMigration(migration: { name: string }) {
    const migrationName = migration.name.toLowerCase();
    try {
      this.db.query("INSERT INTO migrations (name) VALUES (?)", [
        migrationName,
      ]);
    } catch (error) {
      if (error instanceof Error) {
        console.error("❌ Error logging migration:", error.message);
      } else {
        console.error("❌ Unknown error logging migration:", error);
      }
    }
  }

  // deno-lint-ignore require-await
  async unlogMigration(migration: { name: string }) {
    const migrationName = migration.name.toLowerCase();
    try {
      this.db.query("DELETE FROM migrations WHERE name = ?", [migrationName]);
    } catch (error) {
      if (error instanceof Error) {
        console.error("❌ Error removing migration log:", error.message);
      } else {
        console.error("❌ Unknown error removing migration log:", error);
      }
    }
  }

  // deno-lint-ignore require-await
  async executed(): Promise<string[]> {
    try {
      const results = this.db.query("SELECT name FROM migrations") as Array<
        [string]
      >;
      return results.map(([name]) => name);
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          "❌ Error retrieving executed migrations:",
          error.message
        );
      } else {
        console.error(
          "❌ Unknown error retrieving executed migrations:",
          error
        );
      }
      return [];
    }
  }
}

console.log("⏳ Setting up migrations table...");
db.query(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log(`📂 Searching for migrations in: ${MIGRATIONS_DIR}`);

const umzug = new Umzug({
  migrations: {
    glob: join(MIGRATIONS_DIR, "*.sql"),
    resolve: ({ name, path }) => ({
      name,
      path,
      up: async () => {
        const sql = await Deno.readTextFile(path!);

        // Split the SQL file into individual queries by ';'
        const queries = sql
          .split(";")
          .map((query) => query.trim())
          .filter(Boolean);

        try {
          console.log(`🔄 Applying migration: ${name}`);
          db.query("BEGIN TRANSACTION");

          // Execute each query individually
          for (const query of queries) {
            if (query) {
              db.query(query); // Execute each query
              console.log(`  - Executed query: ${query.slice(0, 30)}...`); // Logging part of the query
            }
          }

          // Commit the transaction
          db.query("COMMIT");
          console.log(`✅ Migration ${name} applied successfully.`);
        } catch (error) {
          db.query("ROLLBACK");

          if (error instanceof Error) {
            console.error(`❌ Migration ${name} failed: ${error.message}`);
          } else {
            console.error(`❌ Migration ${name} failed: Unknown error`);
          }
        }
      },
    }),
  },
  context: db,
  storage: new SQLiteStorage(db),
  logger: console,
});

try {
  console.log("⏳ Running migrations...");
  const start = Date.now();

  const migrations = await umzug.up();

  if (migrations.length > 0) {
    console.log("✅ Applied migrations:");
    migrations.forEach((m) => {
      console.log(`  - Name: ${m.name}, Path: ${m.path}`);
    });
  } else {
    console.log("✅ No migrations to apply.");
  }

  const duration = Date.now() - start;
  console.log(`✅ Migrations complete in ${duration}ms.`);
} catch (error) {
  if (error instanceof Error) {
    console.error("❌ Migration failed:", error.message);
  } else {
    console.error("❌ Migration failed: Unknown error:", error);
  }
} finally {
  db.close();
  console.log("🔒 Database connection closed.");
}
