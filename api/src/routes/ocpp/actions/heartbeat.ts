import z from "zod";
import type { wsContext } from "../wsContext";
import { HeartbeatConf, HeartbeatReq } from "../zodDefinitions";
import type { ActionHandler } from ".";

export const heartbeat: ActionHandler = {
  handleRequest: async (
    payload: unknown,
    wsCtx: wsContext
  ): Promise<z.infer<typeof HeartbeatConf>> => {
    try {
      HeartbeatReq.parse(payload);
    } catch {
      // Ignoring validation errors as per OCPP behavior
    }

    const currentTime = new Date().toISOString();
    const charger = wsCtx.get("charger");

    // Update the lastHeartbeat for the charger
    await charger.update({
      lastHeartbeat: currentTime,
      updatedAt: currentTime,
    });

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
