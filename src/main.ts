import { Hono } from "hono";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { api } from "./api/index";

const app = new Hono();

app.use(logger());

app.route("/api", api);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Listening on http://${info.address}:${info.port}`);
  }
);

export type AppType = typeof app;
