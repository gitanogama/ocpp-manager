import { Hono } from "hono";
import { GlobalContext } from "./context";
import { handler } from "./handler";
import { logger } from "../../globals/logger";
import { upgradeWebSocket } from "hono/cloudflare-workers";

export const ocpp = new Hono().get(
  "/version/1.6/*",
  upgradeWebSocket((_c) => {
    logger.info("WebSocket connection initiated");

    const globalContext: GlobalContext = new GlobalContext();

    return {
      async onMessage(event, ws) {
        try {
          let message: string;

          if (event.data instanceof Blob) {
            message = await event.data.text();
          } else if (typeof event.data === "string") {
            message = event.data;
          } else {
            throw new Error("Unsupported WebSocket message type");
          }

          logger.info("Message received from client", {
            source: "router.ts",
            data: { message },
          });

          const response = await handler(message, globalContext);

          ws.send(JSON.stringify(response));
          logger.info("Response sent to client", {
            source: "router.ts",
            data: { response },
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          logger.error("Error processing WebSocket message", {
            source: "router.ts",
            data: { error: errorMessage },
          });

          ws.send(
            JSON.stringify({
              errorCode: "InternalError",
              errorDescription: errorMessage,
            })
          );
        }
      },
      onClose(event) {
        logger.info("WebSocket connection closed", {
          source: "router.ts",
          reason: event.reason || "No reason provided",
          wasClean: event.wasClean,
          code: event.code,
        });
      },
    };
  })
);
