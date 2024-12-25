import { Hono } from "hono";
import { Authorization } from "../../lib/models/Authorization";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const authorizations = new Hono()
  .get("/", async (c) => {
    const authorizations = await Authorization.findMany();
    return c.json(authorizations.map((auth) => auth.serialize()));
  })
  .get(
    "/charger/:chargerId",
    zValidator(
      "param",
      z.object({
        chargerId: z.coerce.number(),
      })
    ),
    async (c) => {
      const { chargerId } = c.req.valid("param");

      const authorizations = await Authorization.findMany({
        eb: (eb) => eb("chargerId", "=", chargerId),
      });

      return c.json(authorizations.map((auth) => auth.serialize()));
    }
  )
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        chargerId: z.number(),
        idTag: z.string(),
        parentIdTag: z.string().nullable().optional(),
        status: z.enum(["Accepted", "Blocked", "Expired", "Invalid"]),
        expiryDate: z.string().nullable().optional(),
      })
    ),
    async (c) => {
      const { chargerId, idTag, parentIdTag, status, expiryDate } =
        c.req.valid("json");

      const newAuthorization = await Authorization.insert({
        chargerId,
        idTag,
        parentIdTag: parentIdTag || null,
        status,
        expiryDate: expiryDate || null,
      });

      return c.json(newAuthorization.serialize());
    }
  )
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
        status: z
          .enum(["Accepted", "Blocked", "Expired", "Invalid"])
          .optional(),
        expiryDate: z.string().nullable().optional(),
      })
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const { status, expiryDate } = c.req.valid("json");

      const authorization = await Authorization.findOneOrThrow({
        eb: (eb) => eb("id", "=", id),
      });

      await authorization.update({
        status,
        expiryDate: expiryDate || null,
      });

      return c.json(authorization.serialize());
    }
  );
