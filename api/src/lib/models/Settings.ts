import type { Selectable } from "kysely";
import { generateBaseModel } from "./base";
import type { DB } from "../db/DBTypes";

export interface Settings extends Selectable<DB["settings"]> {}
export class Settings extends generateBaseModel("settings", "id") {}
