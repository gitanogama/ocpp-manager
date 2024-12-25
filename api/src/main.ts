import { Hono } from "hono";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { api } from "./routes/index";

const app = new Hono();

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.use(logger());

app.route("/api", api({ upgradeWebSocket }));
export { app, upgradeWebSocket };

const server = serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Listening on http://${info.address}:${info.port}`);
  }
);

injectWebSocket(server);

export type AppType = typeof app;
