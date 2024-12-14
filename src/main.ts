import { db } from "./db/db.ts";

console.log(await db.selectFrom("migrations").select("name").execute());
