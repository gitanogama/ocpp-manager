import type { Selectable } from "kysely";
import { generateBaseModel } from "./base";
import type { DB } from "../db/DBTypes";

export interface Connectors extends Selectable<DB["connectors"]> {}
export class Connectors extends generateBaseModel("connectors", "id") {}
