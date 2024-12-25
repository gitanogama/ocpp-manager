import path from "path";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { serveStatic } from "@hono/node-server/serve-static";
import { api } from "./routes/index";
import { logger } from "./lib/globals/logger";
import { customLogger } from "./middlewares/customLogger";

export function createApp() {
  const staticPath = "./build";
  const staticPathFallbackFile = path.join(staticPath, "index.html");

  const app = new Hono()
    .use(customLogger)
    .use("*", serveStatic({ root: staticPath }));

  const nodeWs = createNodeWebSocket({ app });

  const typedApp = app.route("/api", api(nodeWs));

  typedApp.use("*", serveStatic({ path: staticPathFallbackFile }));

  nodeWs.injectWebSocket(
    serve(
      {
        fetch: app.fetch,
        port: 4000,
      },
      (info) => {
        logger.http(`Listening on http://0.0.0.0:${info.port}`);
      }
    )
  );

  return typedApp;
}

export const app = createApp();
export type AppType = ReturnType<typeof createApp>;
