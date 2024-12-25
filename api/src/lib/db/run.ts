import { Umzug } from "umzug";
import path from "path";
import fs from "fs";
import DatabaseClass from "better-sqlite3";
import { env } from "../globals/env";
import { logger } from "../globals/logger";

type Database = InstanceType<typeof DatabaseClass>;

// If you need to ensure that a directory exists:
function ensureDirSync(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.info(`📁 Directory created: ${dirPath}`);
  }
}

const MIGRATIONS_DIR = "./src/lib/db/migrations";
ensureDirSync(MIGRATIONS_DIR);

// Setup the SQLite DB connection
logger.info("🚀 Setting up SQLite database...");
const db = new DatabaseClass(env.get("DATABASE_URL"));

// Helper function for standardizing how we run queries
function runQuery(db: Database, sql: string, params?: any[]) {
  try {
    const stmt = db.prepare(sql);
    if (!params || params.length === 0) {
      return stmt.run();
    } else {
      return stmt.run(...params);
    }
  } catch (error: any) {
    logger.error(`❌ Query error: ${error.message}`);
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
    logger.error(`❌ Query error: ${error.message}`);
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
      logger.info(`✅ Logged migration: ${migrationName}`);
    } catch (error: any) {
      logger.error(`❌ Error logging migration: ${error.message}`);
      throw error;
    }
  }

  async unlogMigration(migration: { name: string }) {
    const migrationName = migration.name.toLowerCase();
    try {
      runQuery(this.db, "DELETE FROM migrations WHERE name = ?", [
        migrationName,
      ]);
      logger.info(`✅ Unlogged migration: ${migrationName}`);
    } catch (error: any) {
      logger.error(`❌ Error removing migration log: ${error.message}`);
      throw error;
    }
  }

  async executed(): Promise<string[]> {
    try {
      const rows = allQuery(this.db, "SELECT name FROM migrations") as Array<{
        name: string;
      }>;
      const executedMigrations = rows.map((r) => r.name);
      logger.info(
        `✅ Retrieved executed migrations: ${executedMigrations.join(", ")}`
      );
      return executedMigrations;
    } catch (error: any) {
      logger.error(`❌ Error retrieving executed migrations: ${error.message}`);
      return [];
    }
  }
}

// Create the migrations table if it doesn’t exist
logger.info("⏳ Setting up migrations table...");
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

logger.info(`📂 Searching for migrations in: ${MIGRATIONS_DIR}`);

// Create the Umzug instance
const umzug = new Umzug({
  migrations: {
    glob: path.join(MIGRATIONS_DIR, "*.sql"),
    resolve: ({ name, path: filePath }) => ({
      name,
      path: filePath,
      up: async () => {
        const sql = fs.readFileSync(filePath!, "utf8");
        const queries = sql
          .split(";")
          .map((query) => query.trim())
          .filter(Boolean);

        try {
          logger.info(`🔄 Applying migration: ${name}`);
          runQuery(db, "BEGIN TRANSACTION");

          for (const query of queries) {
            if (query) {
              runQuery(db, query);
              logger.debug(`  - Executed query: ${query.slice(0, 30)}...`);
            }
          }

          runQuery(db, "COMMIT");
          logger.info(`✅ Migration ${name} applied successfully.`);
        } catch (error: any) {
          runQuery(db, "ROLLBACK");
          logger.error(`❌ Migration ${name} failed: ${error.message}`);
          throw error;
        }
      },
    }),
  },
  context: db,
  storage: new SQLiteStorage(db),
  logger: {
    debug: logger.debug.bind(logger),
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
  },
});

async function runMigrations() {
  try {
    logger.info("⏳ Running migrations...");
    const start = Date.now();

    const migrations = await umzug.up();

    if (migrations.length > 0) {
      logger.info("✅ Applied migrations:");
      migrations.forEach((m) => {
        logger.info(`  - Name: ${m.name}, Path: ${m.path}`);
      });
    } else {
      logger.info("✅ No migrations to apply.");
    }

    const duration = Date.now() - start;
    logger.info(`✅ Migrations complete in ${duration}ms.`);
  } catch (error: any) {
    logger.error(`❌ Migration failed: ${error.message}`);
  } finally {
    db.close();
    logger.info("🔒 Database connection closed.");
  }
}

// Run migrations if this file is executed directly via Node/ts-node
runMigrations();
