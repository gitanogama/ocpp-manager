import z from "zod";

import { MeterValuesRequestSchema, MeterValuesResponseSchema } from "../types";
import type { ActionHandler } from "./ActionHandler";
import type { WSCustomContext } from "../WSCustomContext";
import { Telemetry } from "../../../lib/models/Telemetry";
import { Transaction } from "../../../lib/models/Transaction";

export const meterValues: ActionHandler = {
  handleRequest: async (
    payload: unknown,
    _wsCtx: WSCustomContext
  ): Promise<z.infer<typeof MeterValuesResponseSchema>> => {
    const parsedData = MeterValuesRequestSchema.parse(payload);

    const {
      connectorId: _connector_id,
      meterValue,
      transactionId,
    } = parsedData;

    const transaction = await Transaction.findOne({
      eb: (eb) => eb("id", "=", transactionId || -1),
    });

    if (!transaction) {
      return {};
    }

    await Telemetry.insert({
      transactionId: transaction.id,
      meterValue: {
        raw: meterValue,
      },
    });

    return {};
  },
} as const;
