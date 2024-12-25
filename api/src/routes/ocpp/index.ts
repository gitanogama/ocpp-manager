import { Hono, type Context } from "hono";
import type { NodeWebSocket } from "@hono/node-ws";
import { logger } from "../../lib/globals/logger";
import { GlobalContext } from "./context";
import { handler } from "./handler";
import type { MessageEvent } from "ws";

export const ocpp = ({ upgradeWebSocket }: NodeWebSocket) => {
  const app = new Hono().get(
    "/version/1.6/*",
    upgradeWebSocket((_c: Context) => {
      logger.info("WebSocket connection initiated");
      const globalContext = new GlobalContext();

      return {
        async onMessage(evt: MessageEvent, ws) {
          try {
            const message: string = evt.data.toString();
            logger.info("Received raw WebSocket message", {
              content: message,
            });

            const response = await handler(message, globalContext);

            ws.send(JSON.stringify(response));
            logger.info("Response sent to client", { response });
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : String(err);

            logger.error("Error processing WebSocket message", {
              error: errorMessage,
            });

            ws.send(
              JSON.stringify({
                errorCode: "InternalError",
                errorDescription: errorMessage,
              })
            );
          }
        },
      };
    })
  );

  return app;
};
