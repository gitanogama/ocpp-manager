import { Hono } from "jsr:@hono/hono";
import { logger } from "jsr:@hono/hono/logger";
import { serveStatic } from "jsr:@hono/hono/deno";
import { api } from "./api/index.ts";

const app = new Hono()
  .use(logger())
  .use(
    "/*",
    serveStatic({
      root: "./src/app/build",
    })
  )
  .route("/api", api)
  .get("*", serveStatic({ path: "./src/app/build/index.html" }));

Deno.serve({ port: 3000 }, app.fetch);
