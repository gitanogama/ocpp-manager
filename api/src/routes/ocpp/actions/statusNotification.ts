import z from "zod";
import type { wsContext } from "../wsContext";
import {
  StatusNotificationConf,
  StatusNotificationReq,
} from "../zodDefinitions";
import { Connectors } from "../../../lib/models/Connectors";
import { ChargerStatus } from "../../../lib/models/ChargerStatus";
import type { ActionHandler } from ".";

export const statusNotification: ActionHandler = {
  handleRequest: async (
    payload: unknown,
    wsCtx: wsContext
  ): Promise<z.infer<typeof StatusNotificationConf>> => {
    let parsedData: z.infer<typeof StatusNotificationReq>;

    try {
      parsedData = StatusNotificationReq.parse(payload);
    } catch (error) {
      console.error("Payload parsing failed:", error);
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

    console.debug("Processing statusNotification:", {
      chargerId: charger.id,
      connectorId,
      status,
      errorCode,
      info,
      vendorErrorCode,
      timestamp,
    });

    // Handle `connectorId = 0` as applying to the entire charge point
    if (connectorId === 0) {
      await charger.update({
        lastHeartbeat: timestamp,
        updatedAt: currentTime,
      });

      console.info(`Charge point status updated for chargerId: ${charger.id}`);
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
      console.info(`Updating charger status for connectorId: ${connectorId}`);
      await chargerStatus.update({
        status,
        errorCode: errorCode || "",
        vendorErrorCode: vendorErrorCode || "",
        info: info || "",
        heartbeatTimestamp: timestamp,
      });
    } else {
      console.info(
        `Creating new charger status for chargerId ${charger.id}, connectorId ${connectorId}`
      );
      await ChargerStatus.insert({
        connectorId: existingConnector.id,
        status,
        errorCode: errorCode || "",
        vendorErrorCode: vendorErrorCode || "",
        info: info || "",
        heartbeatTimestamp: timestamp,
      });
    }

    console.info(
      `Connector status updated for chargerId: ${charger.id}, connectorId: ${connectorId}`
    );
    return {};
  },

  handleResponse: async (payload: unknown): Promise<string> => {
    try {
      StatusNotificationConf.parse(payload);
      return "Accepted";
    } catch {
      return "Invalid";
    }
  },
} as const;
