import { Hono } from "jsr:@hono/hono";
import { logger } from "../logger/logger.ts";
import { router } from "./router.ts";

const app = new Hono().route("/ocpp", router);

// Log server start
logger.info("WebSocket server running on ws://localhost:8080", {
  source: "server.ts",
});

// Start the server on port 8080
Deno.serve({ port: 8080 }, app.fetch);
