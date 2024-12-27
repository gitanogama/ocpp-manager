import z from "zod";
import { Connector } from "../../../lib/models/Connector";
import type { ActionHandler } from "./ActionHandler";
import {
  StatusNotificationRequestSchema,
  StatusNotificationResponseSchema,
} from "../types";
import type { WSCustomContext } from "../WSCustomContext";
import { logger } from "../../../lib/globals/logger";

export const statusNotification: ActionHandler = {
  handleRequest: async (
    payload: unknown,
    wsCtx: WSCustomContext
  ): Promise<z.infer<typeof StatusNotificationResponseSchema>> => {
    let parsedData: z.infer<typeof StatusNotificationRequestSchema>;

    try {
      parsedData = StatusNotificationRequestSchema.parse(payload);
    } catch (error) {
      logger.error("Payload parsing failed:", error);
      return {};
    }

    const {
      connectorId,
      status,
      errorCode: _errorCode,
      info: _info,
      vendorErrorCode: _vendorErrorCode,
      timestamp: reportedTimestamp,
    } = parsedData;

    const charger = wsCtx.get("charger");

    if (!charger) {
      throw new Error("Charger not found in context.");
    }

    const timestamp = reportedTimestamp || new Date().toISOString();

    // Handle `connectorId = 0` as applying to the entire charge point
    if (connectorId === 0) {
      await charger.update({
        lastHeartbeat: timestamp,
      });

      return {};
    }

    // Ensure the `Connectors` record exists
    let connector = await Connector.findOne({
      eb: (eb) =>
        eb.and([
          eb("chargerId", "=", charger.id),
          eb("connectorId", "=", connectorId),
        ]),
    });

    if (!connector) {
      console.info(
        `Creating new connector for chargerId ${charger.id} and connectorId ${connectorId}`
      );
      connector = await Connector.insert({
        chargerId: charger.id,
        connectorId,
        status: "Available", // Default initial status
      });
    } else {
      await connector.update({
        status,
      });
    }

    // Fetch the connector ID to ensure the `ChargerStatus` foreign key constraint
    const existingConnector = await Connector.findOneOrThrow({
      eb: (eb) =>
        eb.and([
          eb("chargerId", "=", charger.id),
          eb("connectorId", "=", connectorId),
        ]),
    });

    return {};
  },
} as const;
