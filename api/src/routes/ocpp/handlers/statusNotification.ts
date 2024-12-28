import z from "zod";
import { Connector } from "../../../lib/models/Connector";
import type { ActionHandler } from "./ActionHandler";
import {
  StatusNotificationRequestSchema,
  StatusNotificationResponseSchema,
} from "../types";
import type { WSCustomContext } from "../WSCustomContext";
import { logger } from "../../../lib/globals/logger";

export const statusNotification: ActionHandler = {
  handleRequest: async (
    payload: unknown,
    wsCtx: WSCustomContext
  ): Promise<z.infer<typeof StatusNotificationResponseSchema>> => {
    const { connectorId, status } =
      StatusNotificationRequestSchema.parse(payload);

    const charger = wsCtx.get("charger");

    if (connectorId === 0) {
      await charger.update({
        lastHeartbeat: new Date(),
      });

      return {};
    }

    let connector = await Connector.findOne({
      eb: (eb) =>
        eb.and([
          eb("chargerId", "=", charger.id),
          eb("connectorId", "=", connectorId),
        ]),
    });

    if (!connector) {
      logger.info(
        `Creating new connector for chargerId ${charger.id} and connectorId ${connectorId}`
      );
      connector = await Connector.insert({
        chargerId: charger.id,
        connectorId,
        status: "Available",
      });
    } else {
      await connector.update({
        status,
      });
    }

    return {};
  },
} as const;
