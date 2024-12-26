import { z } from "zod";
import type { wsContext } from "../wsContext";
import { BootNotificationConf, BootNotificationReq } from "../zodDefinitions";
import { Settings } from "../../../lib/models/Settings";
import type { ActionHandler } from ".";

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
    const charger = wsCtx.get("charger");

    // Update charger details
    await charger.update({
      model: parsedData.chargePointModel,
      vendor: parsedData.chargePointVendor,
      firmwareVersion: parsedData.firmwareVersion,
      lastHeartbeat: currentTime,
      updatedAt: currentTime,
    });

    // Fetch settings
    const settings = await Settings.findOneOrThrow();

    // Return the response
    return {
      currentTime,
      interval: settings.heartbeatInterval,
      status: charger.enabled ? "Accepted" : "Rejected",
    };
  },

  handleResponse: async (
    payload: unknown,
    _wsCtx: wsContext
  ): Promise<string> => {
    try {
      BootNotificationConf.parse(payload);
      return "Accepted";
    } catch {
      return "Invalid";
    }
  },
} as const;
