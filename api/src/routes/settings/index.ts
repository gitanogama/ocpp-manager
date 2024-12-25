import { Hono } from "hono";
import { Settings } from "../../lib/models/Settings";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const settings = new Hono()
  .get("/", async (c) => {
    const settings = await Settings.findOneOrThrow();
    return c.json(settings);
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

      const settings = await Settings.findOneOrThrow();

      settings.update({
        heartbeatInterval,
        systemMaintenance:
          systemMaintenance !== undefined
            ? systemMaintenance
              ? 1
              : 0
            : undefined,
      });

      return c.json(settings);
    }
  );
