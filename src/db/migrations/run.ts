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
    this.db.query("INSERT INTO migrations (name) VALUES (?)", [migrationName]);
  }

  // deno-lint-ignore require-await
  async unlogMigration(migration: { name: string }) {
    const migrationName = migration.name.toLowerCase();
    this.db.query("DELETE FROM migrations WHERE name = ?", [migrationName]);
  }

  // deno-lint-ignore require-await
  async executed(): Promise<string[]> {
    const results = this.db.query("SELECT name FROM migrations") as Array<
      [string]
    >;
    return results.map(([name]) => name); // Extract the first value from each row tuple
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
        db.query(sql);
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
  console.error("❌ Migration failed:", error);
} finally {
  db.close();
  console.log("🔒 Database connection closed.");
}
