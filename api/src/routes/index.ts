import { ocpp } from "./ocpp";
import { logs } from "./logs";
import { Hono } from "hono";

export const api = ({ upgradeWebSocket }: { upgradeWebSocket: any }) =>
  new Hono().route("/ocpp", ocpp({ upgradeWebSocket })).route("/logs", logs);
