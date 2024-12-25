import { Hono, type Context } from "hono";
import type { NodeWebSocket } from "@hono/node-ws";
import { logger } from "../../lib/globals/logger";
import { wsContext } from "./wsContext";
import { handler } from "./handler";
import type { MessageEvent } from "ws";
import { getConnInfo } from "@hono/node-server/conninfo";

export const ocpp = ({ upgradeWebSocket }: NodeWebSocket) => {
  const app = new Hono().get(
    "/version/1.6/*",
    upgradeWebSocket((c: Context) => {
      const connInfo = getConnInfo(c);
      const clientIp = connInfo.remote.address;

      logger.http("WebSocket connection initiated", {
        ip: clientIp,
      });

      const globalContext = new wsContext();

      return {
        async onMessage(evt: MessageEvent, ws) {
          try {
            const message: string = evt.data.toString();
            logger.http("Received raw WebSocket message", {
              content: message,
              ip: clientIp,
            });

            const response = await handler(message, globalContext);

            ws.send(JSON.stringify(response));
            logger.http("Response sent to client", {
              response,
              ip: clientIp,
            });
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : String(err);

            logger.error("Error processing WebSocket message", {
              error: errorMessage,
              ip: clientIp,
            });

            ws.send(
              JSON.stringify({
                errorCode: "InternalError",
                errorDescription: errorMessage,
              })
            );
          }
        },

        onClose(_ws) {
          logger.http("WebSocket connection closed", {
            ip: clientIp,
          });
        },
      };
    })
  );

  return app;
};
