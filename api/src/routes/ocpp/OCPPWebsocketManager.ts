import { logger } from "../../lib/globals/logger";
import { z } from "zod";
import {
  ActionEnum,
  CallErrorSchema,
  CallResultSchema,
  CallSchema,
} from "./types";
import { WSCustomContext } from "./WSCustomContext";
import type { WSContext } from "hono/ws";
import { Chargers } from "../../lib/models/Chargers";
import { handler } from "./handlers";
import { HTTPException } from "hono/http-exception";

type Call = z.infer<typeof CallSchema>;
type CallError = z.infer<typeof CallErrorSchema>;
type CallResult<T = any> = z.infer<typeof CallResultSchema> & [3, string, T];

class OCPPWebsocketManager {
  private connections: Map<
    string,
    {
      ws: WSContext<unknown>;
      wsCtx: WSCustomContext;
      pendingRequests: Map<
        string,
        (response: CallResult | CallError | undefined) => void
      >;
    }
  > = new Map();

  public async setConnection(
    shortcode: string,
    ws: WSContext<unknown>
  ): Promise<void> {
    const wsCtx = await this.updateWsCtx(shortcode);
    this.connections.set(shortcode, {
      ws,
      wsCtx,
      pendingRequests: new Map(),
    });
  }

  public cleanInactiveConnections(): void {
    this.connections.forEach((conn, key) => {
      if ([0, 1].includes(conn.ws.readyState)) return;
      this.connections.delete(key);
      logger.info("Removed inactive connection", { shortcode: key });
    });
  }

  public async sendCall<T>({
    shortcode,
    action,
    message,
  }: {
    shortcode: string;
    action: ActionEnum;
    message: unknown;
  }): Promise<CallResult<T> | CallError> {
    const connection = this.connections.get(shortcode);

    if (!connection) {
      logger.error("No active connection for shortcode", { shortcode });
      throw new HTTPException(500, {
        message: `No active connection for shortcode: ${shortcode}`,
      });
    }

    const randomId = crypto.randomUUID().toString();
    const request: Call = [2, randomId, action, message];

    return new Promise((resolve, reject) => {
      connection.pendingRequests.set(randomId, (response) => {
        if (response) {
          resolve(response);
        } else {
          reject(
            new HTTPException(408, {
              message: `Request timed out for shortcode: ${shortcode}`,
            })
          );
        }
      });

      try {
        this.sendMessage({
          shortcode,
          rawMessage: JSON.stringify(request),
        });

        setTimeout(() => {
          if (connection.pendingRequests.has(randomId)) {
            connection.pendingRequests.delete(randomId);
            logger.warn("Request timed out", { action, shortcode, randomId });
            reject(
              new HTTPException(408, {
                message: `Request timed out for shortcode: ${shortcode}`,
              })
            );
          }
        }, 10000);
      } catch (error) {
        connection.pendingRequests.delete(randomId);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error("Failed to send request", {
          action,
          shortcode,
          error: errorMessage,
        });
        reject(
          new HTTPException(500, {
            message: `Failed to send request for shortcode: ${shortcode}`,
          })
        );
      }
    });
  }

  public async sendMessage({
    rawMessage,
    shortcode,
  }: {
    rawMessage: string;
    shortcode: string;
  }): Promise<void> {
    const connection = this.connections.get(shortcode);

    if (!connection) {
      logger.error("No active connection for shortcode", { shortcode });
      throw new HTTPException(500, {
        message: `No active connection for shortcode: ${shortcode}`,
      });
    }

    logger.http("Sending raw message", { rawMessage, shortcode });
    try {
      connection.ws.send(rawMessage);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Failed to send raw message", {
        shortcode,
        error: errorMessage,
      });
      throw error;
    }
  }

  public async handleIncomingMessage(
    shortcode: string,
    message: string
  ): Promise<void> {
    const connection = this.connections.get(shortcode);

    if (!connection) {
      logger.warn("Received message for unknown shortcode", { shortcode });
      return;
    }

    try {
      const parsedMessage = JSON.parse(message);
      connection.wsCtx = await this.updateWsCtx(shortcode);

      if (Array.isArray(parsedMessage)) {
        const [messageType, messageId, ...rest] = parsedMessage;

        switch (messageType) {
          case 2:
            const parsed = CallSchema.safeParse(parsedMessage);
            if (!parsed.success) {
              logger.error("Schema validation failed", {
                shortcode,
                message: parsedMessage,
              });
              return;
            }
            logger.info("incoming request (type 2)", {
              shortcode,
              message,
            });

            const messageResponse = await handler(
              parsed.data,
              connection.wsCtx
            );
            if (messageResponse) {
              this.sendMessage({
                rawMessage: JSON.stringify(messageResponse),
                shortcode,
              });
            }

            break;

          case 3: {
            const [response] = rest;
            const resolve = connection.pendingRequests.get(messageId);
            if (resolve) {
              const result = CallResultSchema.safeParse(parsedMessage);
              if (result.success) {
                resolve(result.data as any);
                logger.info("Resolved CallResult", { shortcode, messageId });
              } else {
                logger.error("Invalid CallResult received", {
                  shortcode,
                  messageId,
                  response,
                });
                resolve(undefined);
              }
              connection.pendingRequests.delete(messageId);
            }
            break;
          }

          case 4: {
            const [errorData] = rest;
            const resolve = connection.pendingRequests.get(messageId);
            if (resolve) {
              const result = CallErrorSchema.safeParse(parsedMessage);
              if (result.success) {
                resolve(result.data);
                logger.error("Call Error received", {
                  shortcode,
                  error: result.data,
                });
              } else {
                logger.error("Invalid Call Error received", {
                  shortcode,
                  rawError: errorData,
                });
                resolve(undefined);
              }
              connection.pendingRequests.delete(messageId);
            }
            break;
          }

          default:
            logger.warn("Unhandled message type received", {
              shortcode,
              messageType,
              message,
            });
        }
      } else {
        logger.http("Unsolicited message received", {
          shortcode,
          message,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Error handling incoming message", {
        shortcode,
        error: errorMessage,
      });
    }
  }

  public async updateWsCtx(shortcode: string): Promise<WSCustomContext> {
    const currentTime = new Date().toISOString();
    try {
      let charger = await Chargers.findOne({
        eb: (eb) => eb("shortcode", "=", shortcode),
      });

      if (!charger) {
        logger.info("Creating new charger", { shortcode });
        charger = await Chargers.insert({
          friendlyName: "Detected Charger",
          shortcode,
          updatedAt: currentTime,
          createdAt: currentTime,
        });
      } else {
        await charger.update({
          lastHeartbeat: currentTime,
          updatedAt: currentTime,
        });
      }

      return new WSCustomContext({ charger });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Error updating context", {
        shortcode,
        error: errorMessage,
      });
      throw new HTTPException(500, {
        message: `Failed to fetch or update charger`,
      });
    }
  }

  public getActiveConnection(shortcode: string) {
    return this.connections.get(shortcode);
  }

  public getActiveConnections() {
    return this.connections;
  }
}

export const ocppWebsocketManager = new OCPPWebsocketManager();
