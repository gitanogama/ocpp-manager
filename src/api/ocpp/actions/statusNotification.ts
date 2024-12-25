import z from "zod";
import type { GlobalContext } from "../context";
import {
  StatusNotificationConf,
  StatusNotificationReq,
} from "../zodDefinitions";
import { db } from "../../../db/db";

export const statusNotification = {
  handleRequest: async (
    payload: unknown,
    globalContext: GlobalContext
  ): Promise<z.infer<typeof StatusNotificationConf>> => {
    let parsedData: z.infer<typeof StatusNotificationReq>;

    try {
      parsedData = StatusNotificationReq.parse(payload);
    } catch {
      return {};
    }

    const {
      connectorId,
      status,
      errorCode,
      info,
      vendorErrorCode,
      timestamp: _timestamp,
    } = parsedData;

    const chargerId = globalContext.get("chargerId");
    if (!chargerId) {
      throw new Error("No chargerId found in global context");
    }

    // Upsert connector for `connectorId`
    await db
      .insertInto("connectors")
      .values({
        chargerId,
        connectorId,
        status,
        errorCode: errorCode || null,
        vendorErrorCode: vendorErrorCode || null,
        info: info || null,
        updatedAt: new Date().toISOString(),
      })
      .onConflict((oc) =>
        oc.columns(["chargerId", "connectorId"]).doUpdateSet({
          status,
          errorCode: errorCode || null,
          vendorErrorCode: vendorErrorCode || null,
          info: info || null,
          updatedAt: new Date().toISOString(),
        })
      )
      .execute();

    return {};
  },

  handleResponse: async (payload: unknown): Promise<string> => {
    try {
      StatusNotificationConf.parse(payload);
      return "Accepted";
    } catch {
      return "Invalid";
    }
  },
} as const;
