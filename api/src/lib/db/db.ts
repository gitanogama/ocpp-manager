import { CamelCasePlugin, Kysely, SqliteDialect } from "kysely";
import Database from "better-sqlite3";
import type { DB } from "./DBTypes";
import { env } from "../globals/env";

const sqliteDb = new Database(env.get("DATABASE_URL"));

export const db = new Kysely<DB>({
  dialect: new SqliteDialect({ database: sqliteDb }),
  plugins: [new CamelCasePlugin()],
});
