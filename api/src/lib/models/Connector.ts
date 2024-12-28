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

export interface Connector extends Selectable<DB["connector"]> {}
export class Connector extends generateBaseModel(
  "connector",
  "id",
  "updatedAt"
) {
  async unlock() {
    const message: z.infer<typeof UnlockConnectorRequestSchema> = {
      connectorId: this.connectorId,
    };

    const charger = await db
      .selectFrom("charger")
      .selectAll("charger")
      .innerJoin("connector", "connector.chargerId", "charger.id")
      .where("connector.id", "=", this.id)
      .executeTakeFirstOrThrow();

    return await ocppWebsocketManager.sendCall({
      shortcode: charger.shortcode,
      action: "UnlockConnector",
      message,
      responseSchema: UnlockConnectorResponseSchema,
    });
  }
}
