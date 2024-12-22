import { createLogger, transports, format, Logform } from "npm:winston";
import { ensureDir } from "https://deno.land/std@0.200.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.200.0/path/mod.ts";

const logDir = join(Deno.cwd(), "src", "logger", "logs");
await ensureDir(logDir);
const logFile = join(logDir, `${new Date().toISOString().split("T")[0]}.log`);

function formatMeta(meta: unknown): string {
  if (!meta || Object.keys(meta).length === 0) return "";
  return ` | ${JSON.stringify(meta, null, 2)}`;
}

export const logger = createLogger({
  level: "debug",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf((info: Logform.TransformableInfo) => {
      const { timestamp, level, message, ...meta } = info;
      return `${timestamp} [${level.toUpperCase()}] ${message}${formatMeta(
        meta
      )}`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf((info: Logform.TransformableInfo) => {
          const { timestamp, level, message, ...meta } = info;
          return `${timestamp} [${level.toUpperCase()}] ${message}${formatMeta(
            meta
          )}`;
        })
      ),
    }),
    new transports.File({
      filename: logFile,
      maxFiles: 14,
    }),
  ],
});
