import type { Selectable } from "kysely";
import { generateBaseModel } from "./base";
import type { DB } from "../db/DBTypes";

export interface Chargers extends Selectable<DB["chargers"]> {}
export class Chargers extends generateBaseModel("chargers", "id") {}
