import z from "zod";
import type { GlobalContext } from "../context";
import { AuthorizeConf, AuthorizeReq } from "../zodDefinitions";
import { db } from "../../../lib/db/db";

export const authorize = {
  handleRequest: async (
    payload: unknown,
    _globalContext: GlobalContext
  ): Promise<z.infer<typeof AuthorizeConf>> => {
    let parsedData: z.infer<typeof AuthorizeReq>;

    // Validate the request payload
    try {
      parsedData = AuthorizeReq.parse(payload);
    } catch {
      return { idTagInfo: { status: "Invalid" } };
    }

    // Fetch authorization info from the `authorization` table
    const authRecord = await db
      .selectFrom("authorization")
      .select(["idTag", "expiryDate", "parentIdTag", "status"])
      .where("idTag", "=", parsedData.idTag)
      .executeTakeFirst();

    // Determine ID tag status
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

  handleResponse: async (payload: unknown): Promise<string> => {
    try {
      AuthorizeConf.parse(payload);
      return "Accepted";
    } catch {
      return "Invalid";
    }
  },
} as const;
