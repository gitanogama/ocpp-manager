import type { Selectable } from "kysely";
import { generateBaseModel } from "./base";
import type { DB } from "../db/DBTypes";
import { ocppWebsocketManager } from "../../routes/ocpp/OCPPWebsocketManager";
import {
  ResetRequestSchema,
  ResetResponseSchema,
} from "../../routes/ocpp/types";
import type { z } from "zod";

export interface Chargers extends Selectable<DB["chargers"]> {}
export class Chargers extends generateBaseModel("chargers", "id") {
  async reset(type: "Hard" | "Soft") {
    const message: z.infer<typeof ResetRequestSchema> = {
      type,
    };
    return await ocppWebsocketManager.sendCall({
      shortcode: this.shortcode,
      action: "Reset",
      message,
      responseSchema: ResetResponseSchema,
    });
  }
}
