import { CamelCasePlugin, Kysely, SqliteDialect } from "kysely";
import Database from "better-sqlite3";
import type { DB } from "./DBTypes";

// Initialize the SQLite database using better-sqlite3
const sqliteDb = new Database("app.db");

// Initialize the Kysely instance
export const db = new Kysely<DB>({
  dialect: new SqliteDialect({ database: sqliteDb }),
  plugins: [new CamelCasePlugin()],
});
