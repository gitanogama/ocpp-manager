import { createLogger, transports, format, Logform } from "npm:winston";
import { ensureDir } from "https://deno.land/std@0.200.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.200.0/path/mod.ts";

// Define log directory and log file
const logDir = join(Deno.cwd(), "src", "logger", "logs");
const logFile = join(logDir, `${new Date().toISOString().split("T")[0]}.log`);

// Ensure log directory exists
await ensureDir(logDir);

// Helper function to format metadata
const formatMeta = (meta: unknown): string => {
  if (!meta || Object.keys(meta).length === 0) return "";
  return ` | ${JSON.stringify(meta, null, 2)}`;
};

// Create logger instance
export const logger = createLogger({
  level: "debug", // Set default log level to debug
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Add timestamp
    format.printf((info: Logform.TransformableInfo) => {
      const { timestamp, level, message, ...meta } = info;
      return `${timestamp} [${level.toUpperCase()}] ${message}${formatMeta(
        meta
      )}`;
    }) // Enhanced log format to include metadata
  ),
  transports: [
    // Console transport
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Add timestamp
        format.printf((info: Logform.TransformableInfo) => {
          const { timestamp, level, message, ...meta } = info;
          return `${timestamp} [${level.toUpperCase()}] ${message}${formatMeta(
            meta
          )}`;
        })
      ),
    }),

    // File transport for persistent logs
    new transports.File({ filename: logFile }),
  ],
});
