import z from "zod";
import type { wsContext } from "../wsContext";
import {
  StatusNotificationConf,
  StatusNotificationReq,
} from "../zodDefinitions";

import type { ActionHandler } from ".";
import { Connectors } from "../../../lib/models/Connectors";
import { ChargerStatus } from "../../../lib/models/ChargerStatus";
import { Chargers } from "../../../lib/models/Chargers"; // Import Chargers model to verify charger existence

export const statusNotification: ActionHandler = {
  handleRequest: async (
    payload: unknown,
    globalContext: wsContext
  ): Promise<z.infer<typeof StatusNotificationConf>> => {
    let parsedData: z.infer<typeof StatusNotificationReq>;

    try {
      parsedData = StatusNotificationReq.parse(payload);
    } catch {
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

    const chargerId = globalContext.get("chargerId");
    if (!chargerId) {
      throw new Error("No chargerId found in global context");
    }

    const currentTime = new Date().toISOString();
    const timestamp = reportedTimestamp || currentTime;

    // Ensure the charger exists before proceeding
    const chargerExists = await Chargers.findOne({
      eb: (eb) => eb("id", "=", chargerId),
    });
    if (!chargerExists) {
      throw new Error(`Charger with ID ${chargerId} does not exist`);
    }

    // Check if the connector exists
    let connector = await Connectors.findOne({
      eb: (eb) =>
        eb.and([
          eb("chargerId", "=", chargerId),
          eb("connectorId", "=", connectorId),
        ]),
    });

    if (connector) {
      // Update the existing connector
      await connector.update({
        status,
        errorCode: errorCode || null,
        vendorErrorCode: vendorErrorCode || null,
        info: info || null,
        updatedAt: currentTime,
      });
    } else {
      // Insert a new connector
      connector = await Connectors.insert({
        chargerId,
        connectorId,
        status,
        errorCode: errorCode || null,
        vendorErrorCode: vendorErrorCode || null,
        info: info || null,
        updatedAt: currentTime,
      });
    }

    // Check if chargerStatus exists for the connector
    let chargerStatus = await ChargerStatus.findOne({
      eb: (eb) => eb("connectorId", "=", connectorId),
    });

    if (chargerStatus) {
      // Update the existing chargerStatus
      await chargerStatus.update({
        status,
        errorCode: errorCode || null,
        vendorErrorCode: vendorErrorCode || null,
        info: info || null,
        heartbeatTimestamp: timestamp,
      });
    } else {
      // Insert a new chargerStatus
      chargerStatus = await ChargerStatus.insert({
        connectorId,
        status,
        errorCode: errorCode || null,
        vendorErrorCode: vendorErrorCode || null,
        info: info || null,
        heartbeatTimestamp: timestamp,
      });
    }

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
