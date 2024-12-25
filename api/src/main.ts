import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { api } from "./routes/index";
import { logger } from "./globals/logger";
import { customLogger } from "./middlewares/customLogger";
import { serveStatic } from "@hono/node-server/serve-static";
import path from "path";
import { log } from "console";

const staticPath = "./build";
const staticPathFallbackFile = path.join(staticPath, "index.html");
log(staticPath, staticPathFallbackFile);

const app = new Hono().use(customLogger);

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app
  .route("/api", api({ upgradeWebSocket }))
  .use(
    "*",
    serveStatic({
      root: staticPath,
    })
  )
  .get("*", serveStatic({ path: staticPathFallbackFile }));

injectWebSocket(
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
console.log("Serving static files from:", staticPath);

export { app, upgradeWebSocket };
export type AppType = typeof app;
