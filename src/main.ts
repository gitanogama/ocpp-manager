import { db } from "./db/db.ts";
import { Hono } from "jsr:@hono/hono";
import { logger } from "jsr:@hono/hono/logger";
import { serveStatic } from "jsr:@hono/hono/deno";
import { ocpp } from "./ocpp/ocpp.ts";

const app = new Hono()
  .use(logger())
  .use(
    "/*",
    serveStatic({
      root: "./src/app/build",
    })
  )
  .route("/ocpp", ocpp)
  .get("*", serveStatic({ path: "./src/app/build/index.html" }));

Deno.serve({ port: 3000 }, app.fetch);
