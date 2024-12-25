import { Hono } from "hono";
import type { NodeWebSocket } from "@hono/node-ws";
import { ocpp } from "./ocpp";
import { logs } from "./logs";

export function api(nodeWs: NodeWebSocket) {
  return new Hono().route("/ocpp", ocpp(nodeWs)).route("/logs", logs);
}
