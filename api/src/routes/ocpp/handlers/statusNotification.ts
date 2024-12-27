import z from "zod";
import { Connectors } from "../../../lib/models/Connectors";
import { ChargerStatus } from "../../../lib/models/ChargerStatus";
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
      errorCode,
      info,
      vendorErrorCode,
      timestamp: reportedTimestamp,
    } = parsedData;

    const charger = wsCtx.get("charger");

    if (!charger) {
      throw new Error("Charger not found in context.");
    }

    const currentTime = new Date().toISOString();
    const timestamp = reportedTimestamp || currentTime;

    // Handle `connectorId = 0` as applying to the entire charge point
    if (connectorId === 0) {
      await charger.update({
        lastHeartbeat: timestamp,
        updatedAt: currentTime,
      });

      return {};
    }

    // Ensure the `Connectors` record exists
    let connector = await Connectors.findOne({
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
      connector = await Connectors.insert({
        chargerId: charger.id,
        connectorId,
        status: "Available", // Default initial status
        updatedAt: currentTime,
        createdAt: currentTime,
      });
    } else {
      await connector.update({
        status,
        updatedAt: currentTime,
      });
    }

    // Fetch the connector ID to ensure the `ChargerStatus` foreign key constraint
    const existingConnector = await Connectors.findOneOrThrow({
      eb: (eb) =>
        eb.and([
          eb("chargerId", "=", charger.id),
          eb("connectorId", "=", connectorId),
        ]),
    });

    // Ensure `ChargerStatus` record exists or create a new one
    let chargerStatus = await ChargerStatus.findOne({
      eb: (eb) => eb("connectorId", "=", existingConnector.id),
    });

    if (chargerStatus) {
      await chargerStatus.update({
        status,
        errorCode: errorCode || "",
        vendorErrorCode: vendorErrorCode || "",
        info: info || "",
        heartbeatTimestamp: timestamp,
      });
    } else {
      await ChargerStatus.insert({
        connectorId: existingConnector.id,
        status,
        errorCode: errorCode || "",
        vendorErrorCode: vendorErrorCode || "",
        info: info || "",
        heartbeatTimestamp: timestamp,
      });
    }

    return {};
  },
} as const;
