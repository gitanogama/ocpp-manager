import z from "zod";
import type { wsContext } from "../wsContext";
import { AuthorizeConf, AuthorizeReq } from "../zodDefinitions";
import type { ActionHandler } from ".";
import { Authorization } from "../../../lib/models/Authorization";

export const authorize: ActionHandler = {
  handleRequest: async (
    payload: unknown,
    _wsCtx: wsContext
  ): Promise<z.infer<typeof AuthorizeConf>> => {
    let parsedData: z.infer<typeof AuthorizeReq>;

    try {
      parsedData = AuthorizeReq.parse(payload);
    } catch {
      return { idTagInfo: { status: "Invalid" } };
    }

    const authRecord = await Authorization.findOne({
      eb: (eb) => eb("idTag", "=", parsedData.idTag),
    });

    const idTagInfo: z.infer<typeof AuthorizeConf>["idTagInfo"] = !authRecord
      ? { status: "Invalid" }
      : authRecord.expiryDate && new Date(authRecord.expiryDate) < new Date()
      ? { status: "Expired" }
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
