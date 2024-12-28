import { Hono } from "hono";
import { Setting } from "../../lib/models/Setting";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Transaction } from "../../lib/models/Transaction";

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
      })
    ),
    async (c) => {
      const { heartbeatInterval, systemMaintenance } = c.req.valid("json");

      const settings = await Setting.findOneOrThrow();

      settings.update({
        heartbeatInterval,
        systemMaintenance,
      });

      return c.json(settings.serialize());
    }
  );
