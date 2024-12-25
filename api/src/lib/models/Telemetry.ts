import type { Selectable } from "kysely";
import { generateBaseModel } from "./base";
import type { DB } from "../db/DBTypes";

export interface Telemetry extends Selectable<DB["telemetry"]> {}
export class Telemetry extends generateBaseModel("telemetry", "id") {}
