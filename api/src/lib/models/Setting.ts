import type { Selectable } from "kysely";
import { generateBaseModel } from "./base";
import type { DB } from "../db/DBTypes";

export interface Setting extends Selectable<DB["setting"]> {}
export class Setting extends generateBaseModel("setting", "id") {}
