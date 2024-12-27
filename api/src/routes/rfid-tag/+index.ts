import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { RfidTag } from "../../lib/models/RfidTag";

export const rfidTag = new Hono()
  .get("/", async (c) => {
    const tags = await RfidTag.findMany();
    return c.json(tags.map((tag) => tag.serialize()));
  })
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        friendlyName: z.string(),
        expiryDate: z.coerce.date().nullable(),
        rfidTag: z.string(),
        wLimit: z.number().nullable(),
      })
    ),
    async (c) => {
      const { friendlyName, expiryDate, rfidTag, wLimit } = c.req.valid("json");

      const newTag = await RfidTag.insert({
        friendlyName,
        expiryDate,
        rfidTag,
        wLimit: wLimit || null,
      });

      return c.json(newTag);
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
        friendlyName: z.string(),
        expiryDate: z.coerce.date().nullable(),
        rfidTag: z.ostring(),
        wLimit: z.number().nullable(),
      })
    ),
    async (c) => {
      const { friendlyName, expiryDate, rfidTag, wLimit } = c.req.valid("json");
      const { id } = c.req.valid("param");

      const tag = await RfidTag.findOneOrThrow({
        eb: (eb) => eb("id", "=", id),
      });

      await tag.update({
        friendlyName,
        rfidTag,
        wLimit: wLimit || null,
        expiryDate,
      });

      return c.json(tag.serialize());
    }
  )
  .delete(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number(),
      })
    ),
    async (c) => {
      const { id } = c.req.valid("param");

      const tag = await RfidTag.findOneOrThrow({
        eb: (eb) => eb("id", "=", id),
      });

      await tag.delete();

      return c.json(tag.serialize());
    }
  );
