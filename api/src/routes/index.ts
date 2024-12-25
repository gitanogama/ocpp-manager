import { Hono } from "hono";
import type { NodeWebSocket } from "@hono/node-ws";
import { ocpp } from "./ocpp";
import { logs } from "./logs";
import { settings } from "./settings";
import { chargers } from "./chargers";
import { authorizations } from "./authorizations";
import { connectors } from "./connectors";

export function api(nodeWs: NodeWebSocket) {
  return new Hono()
    .route("/ocpp", ocpp(nodeWs))
    .route("/logs", logs)
    .route("/settings", settings)
    .route("/chargers", chargers)
    .route("/authorizations", authorizations)
    .route("/connectors", connectors);
}
