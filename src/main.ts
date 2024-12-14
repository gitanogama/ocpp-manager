import { db } from "./db/db.ts";

console.log(await db.selectFrom("migrations").select("name").execute());
import { Hono } from "jsr:@hono/hono";
import { upgradeWebSocket } from "jsr:@hono/hono/deno";

const app = new Hono();

// This route will match all paths and handle WebSocket connections
app.get(
  "*",
  upgradeWebSocket((c) => {
    console.log(`WebSocket connection initiated on: ${c.req.url}`);

    return {
      async onMessage(event, ws) {
        try {
          let message: string;

          // Check if the message is a string or a Blob and handle accordingly
          if (event.data instanceof Blob) {
            message = await event.data.text();
          } else if (typeof event.data === "string") {
            message = event.data;
          } else {
            throw new Error("Unsupported WebSocket message type");
          }

          // Log the received message for debugging
          console.log("Received message:", message);

          // Send the same message back (echo) for testing purposes
          ws.send(`Echo: ${message}`);
        } catch (err) {
          console.error("Error processing WebSocket message:", err);
          ws.send(JSON.stringify({ error: "An error occurred" }));
        }
      },
      onClose() {
        console.log("WebSocket connection closed");
      },
    };
  })
);

Deno.serve({ port: 3000 }, app.fetch);

console.log("WebSocket server running at ws://localhost:3000");
