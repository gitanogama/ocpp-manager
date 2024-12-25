import { Hono, type Context } from "hono";
import { logger } from "../../globals/logger";
import { GlobalContext } from "./context";
import { handler } from "./handler";
import type WebSocket from "ws";
import type { CloseEvent } from "ws";

export const ocpp = ({
  upgradeWebSocket,
}: {
  upgradeWebSocket: (handler: (c: Context) => any) => any;
}) => {
  const app = new Hono();

  app.get(
    "/version/1.6/*",
    upgradeWebSocket((_c: Context) => {
      logger.info("WebSocket connection initiated");

      const globalContext = new GlobalContext();

      return {
        async onMessage(event: MessageEvent, ws: WebSocket) {
          try {
            let message: string;

            if (event.data instanceof Buffer) {
              message = event.data.toString();
            } else if (typeof event.data === "string") {
              message = event.data;
            } else {
              throw new Error("Unsupported WebSocket message type");
            }

            logger.info("Message received from client", {
              data: { message },
            });

            const response = await handler(message, globalContext);

            ws.send(JSON.stringify(response));
            logger.info("Response sent to client", {
              data: { response },
            });
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : String(err);
            logger.error("Error processing WebSocket message", {
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

        onClose(event: CloseEvent) {
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

  return app;
};
