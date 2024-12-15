import { db } from "./db/db.ts";
import { Hono } from "jsr:@hono/hono";
import { logger } from "jsr:@hono/hono/logger";
import { ocpp } from "./ocpp/server.ts";

const app = new Hono();

app.use(logger());

app.route("/", ocpp);

app.get("/", async (c) => {
  // Fetch chargers and join additional data
  const chargers = await db
    .selectFrom("chargers")
    .leftJoin("authorization", "chargers.id", "authorization.chargerId")
    .leftJoin("connectors", "chargers.id", "connectors.chargerId")
    .leftJoin("chargerStatus", "connectors.id", "chargerStatus.connectorId")
    .select([
      "chargers.id as chargerId",
      "chargers.model",
      "chargers.vendor",
      "chargers.serialNumber",
      "chargers.registrationStatus",
      "chargers.firmwareVersion",
      "chargers.updatedAt as chargerUpdatedAt",
      "authorization.idTag",
      "authorization.status as authStatus",
      "authorization.expiryDate",
      "connectors.connectorId",
      "connectors.status as connectorStatus",
      "connectors.errorCode as connectorErrorCode",
      "connectors.info as connectorInfo",
      "connectors.updatedAt as connectorUpdatedAt",
      "chargerStatus.status as currentStatus",
      "chargerStatus.errorCode",
      "chargerStatus.info",
      "chargerStatus.timestamp as statusTimestamp",
    ])
    .execute();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Charger Management</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 text-gray-800">
      <div class="container mx-auto py-8">
        <h1 class="text-2xl font-bold text-center mb-6">Charger Management</h1>
        <table class="table-auto border-collapse border border-gray-400 w-full text-sm">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 px-4 py-2">Charger ID</th>
              <th class="border border-gray-300 px-4 py-2">Model</th>
              <th class="border border-gray-300 px-4 py-2">Vendor</th>
              <th class="border border-gray-300 px-4 py-2">Serial Number</th>
              <th class="border border-gray-300 px-4 py-2">Firmware Version</th>
              <th class="border border-gray-300 px-4 py-2">Registration Status</th>
              <th class="border border-gray-300 px-4 py-2">Last Updated</th>
              <th class="border border-gray-300 px-4 py-2">Auth ID Tag</th>
              <th class="border border-gray-300 px-4 py-2">Auth Status</th>
              <th class="border border-gray-300 px-4 py-2">Auth Expiry</th>
              <th class="border border-gray-300 px-4 py-2">Connector ID</th>
              <th class="border border-gray-300 px-4 py-2">Connector Status</th>
              <th class="border border-gray-300 px-4 py-2">Connector Info</th>
              <th class="border border-gray-300 px-4 py-2">Connector Error Code</th>
              <th class="border border-gray-300 px-4 py-2">Current Status</th>
              <th class="border border-gray-300 px-4 py-2">Status Info</th>
              <th class="border border-gray-300 px-4 py-2">Status Timestamp</th>
              <th class="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${chargers
              .map(
                (charger) => `
                  <tr class="odd:bg-white even:bg-gray-100">
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.chargerId
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.model
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.vendor
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.serialNumber
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.firmwareVersion || "N/A"
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.registrationStatus
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.chargerUpdatedAt || "N/A"
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.idTag || "N/A"
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.authStatus || "N/A"
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.expiryDate || "N/A"
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.connectorId || "N/A"
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.connectorStatus || "N/A"
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.connectorInfo || "N/A"
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.connectorErrorCode || "N/A"
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.currentStatus || "N/A"
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.info || "N/A"
                    }</td>
                    <td class="border border-gray-300 px-4 py-2">${
                      charger.statusTimestamp || "N/A"
                    }</td>
                    <td class="border border-gray-300 px-4 py-2 text-center">
                      ${
                        charger.registrationStatus === "Pending"
                          ? `
                            <form method="POST" action="/approve/${charger.chargerId}">
                              <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Approve</button>
                            </form>
                          `
                          : `
                            <form method="POST" action="/unapprove/${charger.chargerId}">
                              <button class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Unapprove</button>
                            </form>
                          `
                      }
                    </td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;

  return c.html(html);
});

// Handle approve action
app.post("/approve/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  await db
    .updateTable("chargers")
    .set({ registrationStatus: "Accepted" })
    .where("id", "=", id)
    .execute();

  return c.redirect("/");
});

// Handle unapprove action
app.post("/unapprove/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  await db
    .updateTable("chargers")
    .set({ registrationStatus: "Pending" })
    .where("id", "=", id)
    .execute();

  return c.redirect("/");
});

// Start the server
Deno.serve({ port: 3000 }, app.fetch);
