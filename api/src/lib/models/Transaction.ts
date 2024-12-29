import { sql, type Selectable } from "kysely";
import { generateBaseModel } from "./base";
import type { DB } from "../db/DBTypes";
import { ChargeAuthorization } from "./ChargeAuthorization";
import { db } from "../db/db";
import { Connector } from "./Connector";

export interface Transaction extends Selectable<DB["transaction"]> {}
export class Transaction extends generateBaseModel("transaction", "id") {
  async getFullDetail() {
    const [chargeAuthorization, connector, estimatedEnergyDelivered] =
      await Promise.all([
        ChargeAuthorization.findOne({
          eb: (eb) => eb("id", "=", this.chargeAuthorizationId),
        }),
        Connector.findOne({
          eb: (eb) => eb("id", "=", this.connectorId),
        }),
        db
          .selectFrom("telemetry")
          .select([
            sql<number>`
        ROUND(MAX(
          TRIM(BOTH '"' FROM JSONB_PATH_QUERY_FIRST(
            telemetry.meter_value::jsonb,
            '$.raw[*].sampledValue[*] ? (@.measurand == "Energy.Active.Import.Register").value'
          )::TEXT)::NUMERIC
        ) -
        MIN(
          TRIM(BOTH '"' FROM JSONB_PATH_QUERY_FIRST(
            telemetry.meter_value::jsonb,
            '$.raw[*].sampledValue[*] ? (@.measurand == "Energy.Active.Import.Register").value'
          )::TEXT)::NUMERIC
          ))
      `.as("totalEnergyDelivered"),
            sql<string>`MAX(telemetry.created_at)`.as("lastUpdateTimestamp"),
          ])
          .where("transactionId", "=", this.id)
          .where(
            sql<boolean>`
        JSONB_PATH_QUERY_FIRST(
          telemetry.meter_value::jsonb,
          '$.raw[*].sampledValue[*] ? (@.measurand == "Energy.Active.Import.Register").value'
        ) IS NOT NULL
      `
          )
          .executeTakeFirst(),
      ]);

    return {
      ...this.serialize(),
      estimatedEnergyDelivered,
      connector,
      chargeAuthorization: (await chargeAuthorization?.getFullDetail()) || null,
    };
  }
}
