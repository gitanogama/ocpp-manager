import type { Selectable } from "kysely";
import { generateBaseModel } from "./base";
import type { DB } from "../db/DBTypes";

export interface Authorization extends Selectable<DB["authorization"]> {}
export class Authorization extends generateBaseModel("authorization", "id") {}
