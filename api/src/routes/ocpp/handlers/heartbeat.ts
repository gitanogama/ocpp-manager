import z from "zod";
import type { ActionHandler } from "./ActionHandler";
import { HeartbeatRequestSchema, HeartbeatResponseSchema } from "../types";
import type { WSCustomContext } from "../WSCustomContext";

export const heartbeat: ActionHandler = {
  handleRequest: async (
    payload: unknown,
    wsCtx: WSCustomContext
  ): Promise<z.infer<typeof HeartbeatResponseSchema>> => {
    try {
      HeartbeatRequestSchema.parse(payload);
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
} as const;
