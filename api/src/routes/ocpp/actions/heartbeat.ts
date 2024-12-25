import z from "zod";
import type { wsContext } from "../wsContext";
import { HeartbeatConf, HeartbeatReq } from "../zodDefinitions";
import type { ActionHandler } from ".";
import { Chargers } from "../../../lib/models/Chargers";

export const heartbeat: ActionHandler = {
  handleRequest: async (
    payload: unknown,
    globalContext: wsContext
  ): Promise<z.infer<typeof HeartbeatConf>> => {
    try {
      HeartbeatReq.parse(payload);
    } catch {
      // Ignoring validation errors as per OCPP behavior
    }

    // Get the current charger ID from the global context
    const chargerId = globalContext.get("chargerId");
    const currentTime = new Date().toISOString();

    if (chargerId) {
      // Update the lastHeartbeat for the charger

      const charger = await Chargers.findOne({
        eb: (eb) => eb("id", "=", chargerId),
      });

      if (charger) {
        await charger.update({
          lastHeartbeat: currentTime,
          status: "Online",
        });
      }
    }

    return { currentTime };
  },

  handleResponse: async (payload: unknown): Promise<string> => {
    try {
      HeartbeatConf.parse(payload);
      return "Accepted";
    } catch {
      return "Invalid";
    }
  },
} as const;
