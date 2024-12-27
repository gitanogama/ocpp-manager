import { Hono } from "hono";
import { Chargers } from "../../lib/models/Chargers";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { ResetTypeEnum } from "../ocpp/types";
import { Settings } from "../../lib/models/Settings";

export const chargers = new Hono()
  .get("/", async (c) => {
    const settings = await Settings.findOneOrThrow();
    const heartbeatIntervalWithBuffer = settings.heartbeatInterval + 10;

    const chargers = await Chargers.findMany();

    const chargersWithConnectivity = chargers.map((charger) => {
      const lastHeartbeatTime = charger.lastHeartbeat
        ? new Date(charger.lastHeartbeat).getTime()
        : 0;
      const now = Date.now();

      const connectivity: "Online" | "Offline" =
        lastHeartbeatTime > 0 &&
        now - lastHeartbeatTime <= heartbeatIntervalWithBuffer * 1000
          ? "Online"
          : "Offline";

      return {
        ...charger.serialize(),
        connectivity,
      };
    });

    return c.json(chargersWithConnectivity);
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
        status: z.enum(["Accepted", "Rejected", "Pending"]).optional(),
        friendlyName: z.ostring(),
        shortcode: z.string().min(1).toLowerCase(),
      })
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const { status, friendlyName, shortcode } = c.req.valid("json");

      const existingCharger = await Chargers.findOne({
        eb: (eb) => eb("shortcode", "=", shortcode),
      });
      if (!existingCharger) {
        throw new HTTPException(400, {
          message: "A charger with this shortcode does not exist.",
        });
      }
      const charger = await Chargers.findOneOrThrow({
        eb: (eb) => eb("id", "=", id),
      });

      await charger.update({
        status,
        friendlyName,
        shortcode,
      });

      return c.json(charger.serialize());
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

      const existingCharger = await Chargers.findOne({
        eb: (eb) => eb("id", "=", id),
      });
      if (!existingCharger) {
        throw new HTTPException(400, {
          message: "A charger with this id could not be found.",
        });
      }
      await existingCharger.delete();

      return c.json(existingCharger.serialize());
    }
  )
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        friendlyName: z.ostring(),
        shortcode: z.string().min(1).toLowerCase(),
      })
    ),
    async (c) => {
      const { friendlyName, shortcode } = c.req.valid("json");

      const existingCharger = await Chargers.findOne({
        eb: (eb) => eb("shortcode", "=", shortcode),
      });
      if (existingCharger) {
        throw new HTTPException(400, {
          message: "A charger with this shortcode already exists.",
        });
      }

      const newCharger = await Chargers.insert({
        friendlyName,
        shortcode,
        status: "Accepted",
      });

      return c.json(newCharger.serialize(), 201);
    }
  )
  .post(
    "/:id/reset",
    zValidator(
      "param",
      z.object({
        id: z.coerce.number(),
      })
    ),
    zValidator(
      "json",
      z.object({
        type: z.nativeEnum(ResetTypeEnum),
      })
    ),
    async (c) => {
      const { type } = c.req.valid("json");
      const { id } = c.req.valid("param");

      const charger = await Chargers.findOneOrThrow({
        eb: (eb) => eb("id", "=", id),
      });

      const data = await charger.reset(type);

      return c.json({
        success: data[2].status === "Accepted",
      });
    }
  );
