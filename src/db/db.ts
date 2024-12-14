import { Kysely, SqliteDialect } from "npm:kysely";
import Database from "npm:better-sqlite3";
import { DB } from "./db.d.ts";

export const db = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: new Database("app.db"),
  }),
});

export default db;
