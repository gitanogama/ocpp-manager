import type { Selectable } from "kysely";
import { generateBaseModel } from "./base";
import type { DB } from "../db/DBTypes";

export interface ChargerStatus extends Selectable<DB["chargerStatus"]> {}
export class ChargerStatus extends generateBaseModel("chargerStatus", "id") {}
