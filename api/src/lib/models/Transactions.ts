import type { Selectable } from "kysely";
import { generateBaseModel } from "./base";
import type { DB } from "../db/DBTypes";

export interface Transactions extends Selectable<DB["transactions"]> {}
export class Transactions extends generateBaseModel("transactions", "id") {}
