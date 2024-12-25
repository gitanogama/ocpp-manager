import { Hono } from "hono";
import { Chargers } from "../../lib/models/Chargers";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const chargers = new Hono()
  .get("/", async (c) => {
    const chargers = await Chargers.findMany();
    return c.json(chargers.map((charger) => charger.serialize()));
  })
  .patch(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number(),
      })
    ),

    zValidator(
      "json",
      z.object({
        status: z.enum(["Accepted", "Pending", "Rejected", "Disabled"]),
      })
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const { status } = c.req.valid("json");

      const charger = await Chargers.findOneOrThrow({
        eb: (eb) => eb("id", "=", id),
      });

      await charger.update({
        registrationStatus: status,
      });

      return c.json(charger.serialize());
    }
  );
