import z from "zod";
import type { GlobalContext } from "../context";
import { HeartbeatConf, HeartbeatReq } from "../zodDefinitions";

export const heartbeat = {
  handleRequest: async (
    payload: unknown,
    _globalContext: GlobalContext
  ): Promise<z.infer<typeof HeartbeatConf>> => {
    try {
      HeartbeatReq.parse(payload);
    } catch {
      // Ignoring validation errors as per OCPP behavior
    }

    return { currentTime: new Date().toISOString() };
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
