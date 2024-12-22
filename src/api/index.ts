import { Hono } from "jsr:@hono/hono";
import ocpp from "./ocpp/index.ts.ts";
import logs from "./logs/index.ts";
export const api = new Hono().route("/ocpp", ocpp).route("/logs", logs);
