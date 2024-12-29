import type { Selectable } from "kysely";
import { generateBaseModel } from "./base";
import type { DB } from "../db/DBTypes";
import type { z } from "zod";
import {
  UnlockConnectorResponseSchema,
  type UnlockConnectorRequestSchema,
} from "../../routes/ocpp/types";
import { ocppWebsocketManager } from "../../routes/ocpp/OCPPWebsocketManager";
import { db } from "../db/db";
import { Setting } from "./Setting";

export interface Connector extends Selectable<DB["connector"]> {}
export class Connector extends generateBaseModel(
  "connector",
  "id",
  "updatedAt"
) {
  async getCurrentLoad() {
    const setting = await Setting.findOneOrThrow();

    const cutoffTime = new Date(
      Date.now() - (setting.meterValueSampleInterval + 10) * 1000
    );

    const telemetryData = await db
      .selectFrom("telemetry")
      .select(["meterValue", "createdAt"])
      .where("transactionId", "in", (eb) =>
        eb
          .selectFrom("transaction")
          .select("id")
          .where("connectorId", "=", this.id)
      )
      .where("createdAt", ">=", cutoffTime)
      .orderBy("createdAt", "desc")
      .executeTakeFirst();

    const meterValue = telemetryData ? (telemetryData.meterValue as any) : null;
    const valueWh = meterValue
      ? meterValue?.raw?.[0]?.sampledValue?.[4]?.value
      : null;

    return {
      valueWh: valueWh ? Number(valueWh) : 0,
      lastTelemetry: telemetryData?.createdAt || null,
    };
  }

  async getDetailData() {
    const currentLoad = await this.getCurrentLoad();

    return {
      ...this.serialize(),
      currentLoad,
    };
  }

  async unlock() {
    const charger = await db
      .selectFrom("charger")
      .selectAll("charger")
      .innerJoin("connector", "connector.chargerId", "charger.id")
      .where("connector.id", "=", this.id)
      .executeTakeFirstOrThrow();

    const message: z.infer<typeof UnlockConnectorRequestSchema> = {
      connectorId: this.connectorId,
    };

    return await ocppWebsocketManager.sendCall({
      shortcode: charger.shortcode,
      action: "UnlockConnector",
      message,
      responseSchema: UnlockConnectorResponseSchema,
    });
  }
}
