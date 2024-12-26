import z from "zod";
import type { wsContext } from "../wsContext";
import { AuthorizeConf, AuthorizeReq } from "../zodDefinitions";
import { Authorization } from "../../../lib/models/Authorization";
import type { ActionHandler } from ".";

export const authorize: ActionHandler = {
  handleRequest: async (
    payload: unknown,
    wsCtx: wsContext
  ): Promise<z.infer<typeof AuthorizeConf>> => {
    let parsedData: z.infer<typeof AuthorizeReq>;

    try {
      parsedData = AuthorizeReq.parse(payload);
    } catch {
      return { idTagInfo: { status: "Invalid" } };
    }

    const charger = wsCtx.get("charger");

    const authRecord = await Authorization.findOne({
      eb: (eb) => eb("idTag", "=", parsedData.idTag),
    });

    const idTagInfo: z.infer<typeof AuthorizeConf>["idTagInfo"] = !authRecord
      ? { status: "Invalid" }
      : authRecord.expiryDate && new Date(authRecord.expiryDate) < new Date()
      ? { status: "Expired" }
      : authRecord.chargerId !== charger.id
      ? { status: "Blocked" }
      : {
          status: authRecord.status as
            | "Accepted"
            | "Blocked"
            | "Expired"
            | "Invalid",
          expiryDate: authRecord.expiryDate || undefined,
          parentIdTag: authRecord.parentIdTag || undefined,
        };

    return { idTagInfo };
  },

  handleResponse: async (
    payload: unknown,
    _wsCtx: wsContext
  ): Promise<string> => {
    try {
      AuthorizeConf.parse(payload);
      return "Accepted";
    } catch {
      return "Invalid";
    }
  },
} as const;
