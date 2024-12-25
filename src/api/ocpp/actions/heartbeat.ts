// deno-lint-ignore-file require-await
import { GlobalContext } from "../context.ts";
import { HeartbeatReq, HeartbeatConf } from "../zodDefinitions.ts";
import z from "zod";

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
