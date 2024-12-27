import type { Selectable } from "kysely";
import { generateBaseModel } from "./base";
import type { DB } from "../db/DBTypes";

export interface Connector extends Selectable<DB["connector"]> {}
export class Connector extends generateBaseModel(
  "connector",
  "id",
  "updatedAt"
) {}
