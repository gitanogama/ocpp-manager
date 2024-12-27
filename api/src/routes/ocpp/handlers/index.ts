import { logger } from "../../../lib/globals/logger";
import { authorize } from "./authorize";
import { bootNotification } from "./bootNotification";
import { heartbeat } from "./heartbeat";
import { statusNotification } from "./statusNotification";
import {
  CallResultSchema,
  CallSchema,
  ChangeAvailabilityRequestSchema,
  ChangeAvailabilityResponseSchema,
  ChangeConfigurationRequestSchema,
  ChangeConfigurationResponseSchema,
  ClearCacheRequestSchema,
  ClearCacheResponseSchema,
  DataTransferRequestSchema,
  DataTransferResponseSchema,
  GetConfigurationRequestSchema,
  GetConfigurationResponseSchema,
  MeterValuesRequestSchema,
  MeterValuesResponseSchema,
  RemoteStartTransactionRequestSchema,
  RemoteStartTransactionResponseSchema,
  RemoteStopTransactionRequestSchema,
  RemoteStopTransactionResponseSchema,
  ResetRequestSchema,
  ResetResponseSchema,
  StartTransactionRequestSchema,
  StartTransactionResponseSchema,
  StopTransactionRequestSchema,
  StopTransactionResponseSchema,
  UnlockConnectorRequestSchema,
  UnlockConnectorResponseSchema,
} from "../types";
import type { WSCustomContext } from "../WSCustomContext";
import type { z } from "zod";

export const handler = async (
  message: z.infer<typeof CallSchema>,
  wsCtx: WSCustomContext
): Promise<z.infer<typeof CallResultSchema> | void> => {
  try {
    const messageType = message[0]; // 2 for request, 3 for response
    const uniqueId = message[1]; // Unique ID for the request-response pair
    const action = message[2]; // The action (e.g., "BootNotification")
    const payload = message[3]; // Payload

    if (messageType === 3) {
      logger.warn("Skipped message since message type = 3");
      return;
    }

    let responsePayload = {};

    switch (action) {
      case "Authorize":
        responsePayload = await authorize.handleRequest(payload, wsCtx);
        break;

      case "BootNotification":
        responsePayload = await bootNotification.handleRequest(payload, wsCtx);
        break;

      case "Heartbeat":
        responsePayload = await heartbeat.handleRequest(payload, wsCtx);
        break;

      case "StatusNotification":
        responsePayload = await statusNotification.handleRequest(
          payload,
          wsCtx
        );
        break;

      case "ChangeAvailability":
        if (messageType === 2) {
          // Request
          const parsedData = ChangeAvailabilityRequestSchema.parse(message[3]);
          console.log("Parsed ChangeAvailability.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = ChangeAvailabilityResponseSchema.parse(message[3]);
          console.log("Parsed ChangeAvailability.conf:", parsedData);
        }
        break;

      case "ChangeConfiguration":
        if (messageType === 2) {
          // Request
          const parsedData = ChangeConfigurationRequestSchema.parse(message[3]);
          console.log("Parsed ChangeConfiguration.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = ChangeConfigurationResponseSchema.parse(
            message[3]
          );
          console.log("Parsed ChangeConfiguration.conf:", parsedData);
        }
        break;

      case "ClearCache":
        if (messageType === 2) {
          // Request
          const parsedData = ClearCacheRequestSchema.parse(message[3]);
          console.log("Parsed ClearCache.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = ClearCacheResponseSchema.parse(message[3]);
          console.log("Parsed ClearCache.conf:", parsedData);
        }
        break;

      case "DataTransfer":
        if (messageType === 2) {
          // Request
          const parsedData = DataTransferRequestSchema.parse(message[3]);
          console.log("Parsed DataTransfer.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = DataTransferResponseSchema.parse(message[3]);
          console.log("Parsed DataTransfer.conf:", parsedData);
        }
        break;

      case "GetConfiguration":
        if (messageType === 2) {
          // Request
          const parsedData = GetConfigurationRequestSchema.parse(message[3]);
          console.log("Parsed GetConfiguration.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = GetConfigurationResponseSchema.parse(message[3]);
          console.log("Parsed GetConfiguration.conf:", parsedData);
        }
        break;

      case "MeterValues":
        if (messageType === 2) {
          // Request
          const parsedData = MeterValuesRequestSchema.parse(message[3]);
          console.log("Parsed MeterValues.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = MeterValuesResponseSchema.parse(message[3]);
          console.log("Parsed MeterValues.conf:", parsedData);
        }
        break;

      case "StartTransaction":
        if (messageType === 2) {
          // Request
          const parsedData = StartTransactionRequestSchema.parse(message[3]);
          console.log("Parsed StartTransaction.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = StartTransactionResponseSchema.parse(message[3]);
          console.log("Parsed StartTransaction.conf:", parsedData);
        }
        break;

      case "StopTransaction":
        if (messageType === 2) {
          // Request
          const parsedData = StopTransactionRequestSchema.parse(message[3]);
          console.log("Parsed StopTransaction.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = StopTransactionResponseSchema.parse(message[3]);
          console.log("Parsed StopTransaction.conf:", parsedData);
        }
        break;

      case "RemoteStartTransaction":
        if (messageType === 2) {
          // Request
          const parsedData = RemoteStartTransactionRequestSchema.parse(
            message[3]
          );
          console.log("Parsed RemoteStartTransaction.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = RemoteStartTransactionResponseSchema.parse(
            message[3]
          );
          console.log("Parsed RemoteStartTransaction.conf:", parsedData);
        }
        break;

      case "RemoteStopTransaction":
        if (messageType === 2) {
          // Request
          const parsedData = RemoteStopTransactionRequestSchema.parse(
            message[3]
          );
          console.log("Parsed RemoteStopTransaction.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = RemoteStopTransactionResponseSchema.parse(
            message[3]
          );
          console.log("Parsed RemoteStopTransaction.conf:", parsedData);
        }
        break;

      case "Reset":
        if (messageType === 2) {
          // Request
          const parsedData = ResetRequestSchema.parse(message[3]);
          console.log("Parsed Reset.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = ResetResponseSchema.parse(message[3]);
          console.log("Parsed Reset.conf:", parsedData);
        }
        break;

      case "UnlockConnector":
        if (messageType === 2) {
          // Request
          const parsedData = UnlockConnectorRequestSchema.parse(message[3]);
          console.log("Parsed UnlockConnector.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = UnlockConnectorResponseSchema.parse(message[3]);
          console.log("Parsed UnlockConnector.conf:", parsedData);
        }
        break;

      // Add more actions here as needed
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return [3, uniqueId, responsePayload];
  } catch (error) {
    console.error("Error processing message:", error);
    return [
      4,
      "unique-error-id",
      { errorCode: "InternalError", errorDescription: String(error) },
    ];
  }
};
