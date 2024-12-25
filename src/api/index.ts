import { Hono } from "hono";
import ocpp from "./ocpp/index.ts";
import logs from "./logs/index.ts";

export const api = new Hono().route("/ocpp", ocpp).route("/logs", logs);
