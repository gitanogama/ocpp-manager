import { createLogger, transports, format } from "winston";
import fs from "fs";
import path from "path";
import type { TransformableInfo } from "logform";

export const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(
  logDir,
  `${new Date().toISOString().split("T")[0]}.log`
);

function formatMeta(meta: unknown): string {
  if (!meta || Object.keys(meta).length === 0) return "";
  return ` | ${JSON.stringify(meta, null, 2)}`;
}

export const logger = createLogger({
  level: "debug",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf((info: TransformableInfo) => {
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
        format.printf((info: TransformableInfo) => {
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
