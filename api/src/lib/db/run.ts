// migrate.ts (Node.js / TypeScript example)

import { Umzug } from "umzug";
import path from "path";
import fs from "fs";
import DatabaseClass from "better-sqlite3";

type Database = InstanceType<typeof DatabaseClass>;

// If you need to ensure that a directory exists:
function ensureDirSync(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const MIGRATIONS_DIR = "./src/db/migrations";
ensureDirSync(MIGRATIONS_DIR);

// Setup the SQLite DB connection
console.log("🚀 Setting up SQLite database...");
const db = new DatabaseClass("app.db");

// Helper function for standardizing how we run queries
// better-sqlite3 requires using .prepare(...).run(...) or .all(...)
function runQuery(db: Database, sql: string, params?: any[]) {
  try {
    const stmt = db.prepare(sql);
    if (!params || params.length === 0) {
      return stmt.run();
    } else {
      return stmt.run(...params);
    }
  } catch (error: any) {
    console.error("❌ Query error:", error.message);
    throw error;
  }
}

function allQuery(db: Database, sql: string, params?: any[]) {
  try {
    const stmt = db.prepare(sql);
    if (!params || params.length === 0) {
      return stmt.all();
    } else {
      return stmt.all(...params);
    }
  } catch (error: any) {
    console.error("❌ Query error:", error.message);
    throw error;
  }
}

// Custom storage class for Umzug using better-sqlite3
class SQLiteStorage {
  constructor(private db: Database) {}

  async logMigration(migration: { name: string }) {
    const migrationName = migration.name.toLowerCase();
    try {
      runQuery(this.db, "INSERT INTO migrations (name) VALUES (?)", [
        migrationName,
      ]);
    } catch (error: any) {
      console.error("❌ Error logging migration:", error.message);
      throw error;
    }
  }

  async unlogMigration(migration: { name: string }) {
    const migrationName = migration.name.toLowerCase();
    try {
      runQuery(this.db, "DELETE FROM migrations WHERE name = ?", [
        migrationName,
      ]);
    } catch (error: any) {
      console.error("❌ Error removing migration log:", error.message);
      throw error;
    }
  }

  async executed(): Promise<string[]> {
    try {
      const rows = allQuery(this.db, "SELECT name FROM migrations") as Array<{
        name: string;
      }>;
      return rows.map((r) => r.name);
    } catch (error: any) {
      console.error("❌ Error retrieving executed migrations:", error.message);
      return [];
    }
  }
}

// Create the migrations table if it doesn’t exist
console.log("⏳ Setting up migrations table...");
runQuery(
  db,
  `
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`
);

console.log(`📂 Searching for migrations in: ${MIGRATIONS_DIR}`);

// Create the Umzug instance
const umzug = new Umzug({
  migrations: {
    // Use path.join for cross-platform safety
    glob: path.join(MIGRATIONS_DIR, "*.sql"),
    // A custom resolver to handle .sql files
    resolve: ({ name, path: filePath }) => ({
      name,
      path: filePath,
      up: async () => {
        // Read the .sql file contents
        const sql = fs.readFileSync(filePath!, "utf8");
        // Split into individual queries by ';'
        const queries = sql
          .split(";")
          .map((query) => query.trim())
          .filter(Boolean);

        try {
          console.log(`🔄 Applying migration: ${name}`);
          // Start a transaction
          runQuery(db, "BEGIN TRANSACTION");

          // Execute each query individually
          for (const query of queries) {
            if (query) {
              runQuery(db, query);
              console.log(`  - Executed query: ${query.slice(0, 30)}...`);
            }
          }

          // Commit the transaction
          runQuery(db, "COMMIT");
          console.log(`✅ Migration ${name} applied successfully.`);
        } catch (error: any) {
          runQuery(db, "ROLLBACK");
          console.error(`❌ Migration ${name} failed: ${error.message}`);
          throw error;
        }
      },
    }),
  },
  context: db,
  storage: new SQLiteStorage(db),
  logger: console,
});

async function runMigrations() {
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
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    db.close();
    console.log("🔒 Database connection closed.");
  }
}

// Run migrations if this file is executed directly via Node/ts-node
if (require.main === module) {
  runMigrations();
}

// Otherwise, you can import { runMigrations } from './migrate.js' in other parts of your code.
