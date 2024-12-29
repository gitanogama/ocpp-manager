import { Hono } from "hono";
import { Setting } from "../../lib/models/Setting";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const setting = new Hono()
  .get("/", async (c) => {
    const settings = await Setting.findOneOrThrow();
    return c.json(settings.serialize());
  })
  .patch(
    "/",
    zValidator(
      "json",
      z.object({
        heartbeatInterval: z.number().optional(),
        systemMaintenance: z.boolean().optional(),
        meterValueSampleInterval: z.number().optional(),
        clockAlignedDataInterval: z.number().optional(),
      })
    ),
    async (c) => {
      const {
        heartbeatInterval,
        systemMaintenance,
        meterValueSampleInterval,
        clockAlignedDataInterval,
      } = c.req.valid("json");

      const settings = await Setting.findOneOrThrow();

      await settings.update({
        heartbeatInterval,
        systemMaintenance,
        meterValueSampleInterval,
        clockAlignedDataInterval,
      });

      await Setting.applyCurrentViaChangeConfiguration();

      return c.json(settings.serialize());
    }
  );
