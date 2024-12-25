import { ocpp } from "./ocpp";
import { logs } from "./logs";
import { Hono } from "hono";

export const api = new Hono().route("/ocpp", ocpp).route("/logs", logs);
