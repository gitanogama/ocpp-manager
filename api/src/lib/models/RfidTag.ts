import type { Selectable } from "kysely";
import { generateBaseModel } from "./base";
import type { DB } from "../db/DBTypes";

export interface RfidTag extends Selectable<DB["rfidTag"]> {}
export class RfidTag extends generateBaseModel("rfidTag", "id", "updatedAt") {}
