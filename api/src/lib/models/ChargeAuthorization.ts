import type { Selectable } from "kysely";
import { generateBaseModel } from "./base";
import type { DB } from "../db/DBTypes";

export interface ChargeAuthorization
  extends Selectable<DB["chargeAuthorization"]> {}
export class ChargeAuthorization extends generateBaseModel(
  "chargeAuthorization",
  "id"
) {}
