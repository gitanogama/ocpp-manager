import { z } from "zod";
import type { wsContext } from "../wsContext";
import { BootNotificationConf, BootNotificationReq } from "../zodDefinitions";
import type { ActionHandler } from ".";
import { Chargers } from "../../../lib/models/Chargers";
import { Settings } from "../../../lib/models/Settings";

export const bootNotification: ActionHandler = {
  handleRequest: async (
    payload: unknown,
    wsCtx: wsContext
  ): Promise<z.infer<typeof BootNotificationConf>> => {
    let parsedData: z.infer<typeof BootNotificationReq>;

    try {
      parsedData = BootNotificationReq.parse(payload);
    } catch {
      return {
        currentTime: new Date().toISOString(),
        interval: 0,
        status: "Rejected",
      };
    }

    const currentTime = new Date().toISOString();

    // Use `chargePointSerialNumber` consistently
    const serialNumber = parsedData.chargePointSerialNumber || "";

    // Check if the charger already exists
    let charger = await Chargers.findOne({
      eb: (eb) => eb("serialNumber", "=", serialNumber),
    });

    if (charger) {
      // Update the existing charger
      await charger.update({
        model: parsedData.chargePointModel,
        vendor: parsedData.chargePointVendor,
        firmwareVersion: parsedData.firmwareVersion,
        lastHeartbeat: currentTime,
        status: "Online", // Update to online during repeated boots
        updatedAt: currentTime,
      });
    } else {
      // Insert a new charger
      charger = await Chargers.insert({
        serialNumber,
        model: parsedData.chargePointModel,
        vendor: parsedData.chargePointVendor,
        firmwareVersion: parsedData.firmwareVersion,
        registrationStatus: "Pending",
        lastHeartbeat: currentTime,
        status: "Online",
        updatedAt: currentTime,
      });
    }

    // Get the registration status
    const currentStatus = charger?.registrationStatus || "Pending";

    // Set the charger ID in the WebSocket context
    if (charger?.id) {
      wsCtx.set("chargerId", charger.id);
    }

    // Fetch settings
    const settings = await Settings.findOneOrThrow();

    // Return the response
    return {
      currentTime,
      interval: settings.heartbeatInterval,
      status: currentStatus === "Pending" ? "Pending" : "Accepted",
    };
  },

  handleResponse: async (payload: unknown): Promise<string> => {
    try {
      BootNotificationConf.parse(payload);
      return "Accepted";
    } catch {
      return "Invalid";
    }
  },
} as const;
