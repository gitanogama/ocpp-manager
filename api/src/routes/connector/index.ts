import { Hono } from "hono";
import { Connector } from "../../lib/models/Connector";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const connector = new Hono()
  .get("/", async (c) => {
    const connectors = await Connector.findMany();
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

      const connectors = await Connector.findMany({
        eb: (eb) => eb("chargerId", "=", id),
      });

      return c.json(connectors.map((connector) => connector.serialize()));
    }
  );
