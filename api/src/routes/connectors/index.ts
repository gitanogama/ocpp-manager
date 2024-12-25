import { Hono } from "hono";
import { Connectors } from "../../lib/models/Connectors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const connectors = new Hono()
  .get("/", async (c) => {
    const connectors = await Connectors.findMany();
    return c.json(connectors.map((connector) => connector.serialize()));
  })
  .get(
    "/charger/:id",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number(),
      })
    ),
    async (c) => {
      const { id } = c.req.valid("param");

      const connectors = await Connectors.findMany({
        eb: (eb) => eb("chargerId", "=", id),
      });

      return c.json(connectors.map((connector) => connector.serialize()));
    }
  );
