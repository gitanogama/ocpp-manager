import type { MiddlewareHandler } from "hono";
import { logger } from "../lib/globals/logger";

export const customLogger: MiddlewareHandler = async (c, next) => {
  const start = Date.now(); // Capture start time for elapsed time calculation
  const method = c.req.method; // HTTP method (GET, POST, etc.)
  const path = c.req.url; // Request path

  // Log incoming request
  logger.http(`--> ${method} ${path}`);

  try {
    // Pass control to the next middleware/handler
    await next();
  } catch (err) {
    // Log error details and rethrow for further handling
    logger.error(
      `[ERROR] ${method} ${path} - ${
        err instanceof Error ? err.message : String(err)
      }`
    );
    throw err;
  }

  // Gather response metrics
  const statusCode = c.res.status; // Response status code
  const elapsed = Date.now() - start; // Time taken to handle the request

  logger.http(`<-- ${method} ${path} ${statusCode} ${elapsed}ms`);
};
