import { Hono } from "jsr:@hono/hono";
import { upgradeWebSocket } from "jsr:@hono/hono/deno";
import { handler } from "./handler.ts"; // Your OCPP handler
import { logger } from "../logger/logger.ts"; // Logger utility

export const router = new Hono().get(
  "/version/1.6",
  upgradeWebSocket((c) => {
    logger.info("WebSocket connection initiated", {
      source: "router.ts",
      data: { path: c.req.url },
    });

    return {
      async onMessage(event, ws) {
        try {
          let message: string;

          // Handle Blob or String messages
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

          // Parse the incoming JSON message

          // Call the OCPP handler function with parsed message
          const response = await handler(message);

          // Send the response back to the WebSocket client
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

          // Send error message back to client
          ws.send(JSON.stringify({ error: "An error occurred" }));
        }
      },
      onClose: () => {
        logger.info("WebSocket connection closed", {
          source: "router.ts",
        });
      },
    };
  })
);
