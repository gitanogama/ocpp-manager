import { Hono } from "hono";
import type { NodeWebSocket } from "@hono/node-ws";
import { logger } from "../../lib/globals/logger";
import { wsContext } from "./wsContext";
import { handler } from "./handler";
import { getConnInfo } from "@hono/node-server/conninfo";
import { Chargers } from "../../lib/models/Chargers";
import type { WSContext } from "hono/ws";

export const ocpp = ({ upgradeWebSocket }: NodeWebSocket) => {
  const app = new Hono().get(
    "/version/1.6/:shortcode",
    upgradeWebSocket((c) => {
      const clientIp = getConnInfo(c).remote.address;
      const shortcode = (c.req.param("shortcode") || "").trim().toLowerCase();

      if (!shortcode) {
        logger.error("No shortcode provided.");
        throw new Error("Shortcode is required");
      }

      logger.http("WebSocket connection initiated", {
        ip: clientIp,
        shortcode,
      });

      const updateContext = async (): Promise<wsContext> => {
        const currentTime = new Date().toISOString();
        try {
          let charger = await Chargers.findOne({
            eb: (eb) => eb("shortcode", "=", shortcode),
          });

          if (!charger) {
            logger.info(`Creating new charger for shortcode: ${shortcode}`);
            charger = await Chargers.insert({
              friendlyName: "Detected Charger",
              enabled: 0,
              shortcode,
              updatedAt: currentTime,
              createdAt: currentTime,
            });
          } else {
            // Update lastHeartbeat and keep charger up to date
            await charger.update({
              lastHeartbeat: currentTime,
              updatedAt: currentTime,
            });
          }

          logger.http("Fetched charger object", { charger });
          return new wsContext({ charger });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          logger.error("Error fetching or updating charger", {
            error: errorMessage,
          });
          throw new Error("Failed to fetch or update charger");
        }
      };

      const handleMessage = async (
        message: string,
        ws: WSContext<unknown>
      ): Promise<void> => {
        try {
          const wsCtx = await updateContext(); // Always fetch the latest charger object

          logger.http("Received WebSocket message", {
            content: message,
            ip: clientIp,
          });

          const response = await handler(message, wsCtx);
          ws.send(JSON.stringify(response));
          logger.http("Response sent", { response, ip: clientIp });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          logger.error("Error processing message", {
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
      };

      return {
        async onOpen(_e: Event, ws) {
          try {
            await updateContext();
          } catch (error) {
            ws.close(1011, "Internal server error.");
          }
        },

        async onMessage(e: MessageEvent, ws) {
          await handleMessage(e.data, ws);
        },

        onClose(_e) {
          logger.http("WebSocket connection closed", {
            ip: clientIp,
            shortcode,
          });
        },
      };
    })
  );

  return app;
};
