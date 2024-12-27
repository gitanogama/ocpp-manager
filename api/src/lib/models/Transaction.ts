import type { Selectable } from "kysely";
import { generateBaseModel } from "./base";
import type { DB } from "../db/DBTypes";

export interface Transaction extends Selectable<DB["transaction"]> {}
export class Transaction extends generateBaseModel("transaction", "id") {}
