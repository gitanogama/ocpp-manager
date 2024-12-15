// deno-lint-ignore-file require-await
import { z } from "npm:zod";
import { db } from "../../db/db.ts";
import {
  BootNotificationConf,
  BootNotificationReq,
} from "../zodDefinitions.ts";
import { GlobalContext } from "../context.ts";

export const bootNotification = {
  handleRequest: async (
    payload: unknown,
    globalContext: GlobalContext
  ): Promise<z.infer<typeof BootNotificationConf>> => {
    let parsedData: z.infer<typeof BootNotificationReq>;

    try {
      parsedData = BootNotificationReq.parse(payload);
    } catch {
      return {
        currentTime: new Date().toISOString(),
        interval: 0,
        status: "Rejected",
      };
    }

    const upsertResult = await db
      .insertInto("chargers")
      .values({
        serialNumber: parsedData.chargePointSerialNumber || "",
        model: parsedData.chargePointModel,
        vendor: parsedData.chargePointVendor,
        firmwareVersion: parsedData.firmwareVersion || null,
        registrationStatus: "Pending",
        updatedAt: new Date().toISOString(),
      })
      .onConflict((oc) =>
        oc.column("serialNumber").doUpdateSet({
          model: parsedData.chargePointModel,
          vendor: parsedData.chargePointVendor,
          firmwareVersion: parsedData.firmwareVersion || null,
          updatedAt: new Date().toISOString(),
        })
      )
      .returning(["id", "registrationStatus"])
      .execute();

    const currentStatus = upsertResult[0]?.registrationStatus || "Pending";

    if (upsertResult[0]?.id) {
      globalContext.set("chargerId", upsertResult[0].id);
    }

    return {
      currentTime: new Date().toISOString(),
      interval: 300,
      status: currentStatus === "Pending" ? "Pending" : "Accepted",
    };
  },

  handleResponse: async (payload: unknown): Promise<string> => {
    try {
      BootNotificationConf.parse(payload);
      return "Accepted";
    } catch {
      return "Invalid";
    }
  },
} as const;
