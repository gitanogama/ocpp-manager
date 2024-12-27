import z from "zod";
import { ChargeAuthorization } from "../../../lib/models/ChargeAuthorization";
import type { ActionHandler } from "./ActionHandler";
import { AuthorizeRequestSchema, AuthorizeResponseSchema } from "../types";
import type { WSCustomContext } from "../WSCustomContext";

export const authorize: ActionHandler = {
  handleRequest: async (
    payload: unknown,
    wsCtx: WSCustomContext
  ): Promise<z.infer<typeof AuthorizeResponseSchema>> => {
    let parsedData: z.infer<typeof AuthorizeRequestSchema>;

    try {
      parsedData = AuthorizeRequestSchema.parse(payload);
    } catch {
      return { idTagInfo: { status: "Invalid" } };
    }

    const charger = wsCtx.get("charger");

    const authRecord = await ChargeAuthorization.findOne({
      eb: (eb) => eb("idTag", "=", parsedData.idTag),
    });

    const idTagInfo: z.infer<typeof AuthorizeResponseSchema>["idTagInfo"] =
      !authRecord
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
} as const;
