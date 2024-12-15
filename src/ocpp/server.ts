import { Hono } from "jsr:@hono/hono";

import { router } from "./router.ts";

export const ocpp = new Hono().route("/ocpp", router);
