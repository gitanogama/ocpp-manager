import { Hono, type Context } from "hono";
import type { NodeWebSocket } from "@hono/node-ws";
import { logger } from "../../lib/globals/logger";
import { GlobalContext } from "./context";
import { handler } from "./handler";

export const ocpp = ({ upgradeWebSocket }: NodeWebSocket) => {
  const app = new Hono().get(
    "/version/1.6/*",
    upgradeWebSocket((_c: Context) => {
      logger.info("WebSocket connection initiated");
      const globalContext = new GlobalContext();

      return {
        async onMessage(evt, ws) {
          try {
            let message: string;
            if (typeof evt === "string") {
              message = evt;
            } else if (evt instanceof Buffer) {
              message = evt.toString();
            } else {
              throw new Error("Unsupported WebSocket message type");
            }

            logger.info("Message received from client", { data: { message } });

            const response = await handler(message, globalContext);
            ws.send(JSON.stringify(response));

            logger.info("Response sent to client", { data: { response } });
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

        onClose(_ws, _event) {
          logger.info("WebSocket connection closed");
        },
      };
    })
  );

  return app;
};
