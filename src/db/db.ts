import { CamelCasePlugin, Kysely } from "npm:kysely";
import { DB } from "./db.d.ts";
import { DB as DenoSQLite } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { DenoSqliteDialect } from "jsr:@soapbox/kysely-deno-sqlite";

const sqliteDb = new DenoSQLite("app.db");

export const db = new Kysely<DB>({
  dialect: new DenoSqliteDialect({ database: sqliteDb }),
  plugins: [new CamelCasePlugin()],
});
