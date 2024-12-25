import { authorize } from "./actions/authorize";
import { bootNotification } from "./actions/bootNotification";
import { heartbeat } from "./actions/heartbeat";
import { statusNotification } from "./actions/statusNotification";
import type { GlobalContext } from "./context";
import {
  ChangeAvailabilityConf,
  ChangeAvailabilityReq,
  ChangeConfigurationConf,
  ChangeConfigurationReq,
  ClearCacheConf,
  ClearCacheReq,
  DataTransferConf,
  DataTransferReq,
  GetConfigurationConf,
  GetConfigurationReq,
  MeterValuesConf,
  MeterValuesReq,
  OCPPMessage,
  RemoteStartTransactionConf,
  RemoteStartTransactionReq,
  RemoteStopTransactionConf,
  RemoteStopTransactionReq,
  ResetConf,
  ResetReq,
  StartTransactionConf,
  StartTransactionReq,
  StopTransactionConf,
  StopTransactionReq,
  UnlockConnectorConf,
  UnlockConnectorReq,
} from "./zodDefinitions";

export const handler = async (
  message: string,
  globalContext: GlobalContext
): Promise<(object | string | number)[]> => {
  try {
    const body = OCPPMessage.parse(JSON.parse(message));

    const messageType = body[0]; // 2 for request, 3 for response
    const uniqueId = body[1]; // Unique ID for the request-response pair
    const action = body[2]; // The action (e.g., "BootNotification")
    const payload = body[3]; // Payload

    let responsePayload = {};

    switch (action) {
      case "Authorize":
        responsePayload =
          messageType === 2
            ? await authorize.handleRequest(payload, globalContext)
            : await authorize.handleResponse(payload);
        break;

      case "BootNotification":
        responsePayload =
          messageType === 2
            ? await bootNotification.handleRequest(payload, globalContext)
            : await bootNotification.handleResponse(payload);
        break;

      case "Heartbeat":
        responsePayload =
          messageType === 2
            ? await heartbeat.handleRequest(payload, globalContext)
            : await heartbeat.handleResponse(payload);
        break;

      case "StatusNotification":
        responsePayload =
          messageType === 2
            ? await statusNotification.handleRequest(payload, globalContext)
            : await statusNotification.handleResponse(payload);
        break;

      case "ChangeAvailability":
        if (messageType === 2) {
          // Request
          const parsedData = ChangeAvailabilityReq.parse(body[3]);
          console.log("Parsed ChangeAvailability.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = ChangeAvailabilityConf.parse(body[3]);
          console.log("Parsed ChangeAvailability.conf:", parsedData);
        }
        break;

      case "ChangeConfiguration":
        if (messageType === 2) {
          // Request
          const parsedData = ChangeConfigurationReq.parse(body[3]);
          console.log("Parsed ChangeConfiguration.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = ChangeConfigurationConf.parse(body[3]);
          console.log("Parsed ChangeConfiguration.conf:", parsedData);
        }
        break;

      case "ClearCache":
        if (messageType === 2) {
          // Request
          const parsedData = ClearCacheReq.parse(body[3]);
          console.log("Parsed ClearCache.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = ClearCacheConf.parse(body[3]);
          console.log("Parsed ClearCache.conf:", parsedData);
        }
        break;

      case "DataTransfer":
        if (messageType === 2) {
          // Request
          const parsedData = DataTransferReq.parse(body[3]);
          console.log("Parsed DataTransfer.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = DataTransferConf.parse(body[3]);
          console.log("Parsed DataTransfer.conf:", parsedData);
        }
        break;

      case "GetConfiguration":
        if (messageType === 2) {
          // Request
          const parsedData = GetConfigurationReq.parse(body[3]);
          console.log("Parsed GetConfiguration.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = GetConfigurationConf.parse(body[3]);
          console.log("Parsed GetConfiguration.conf:", parsedData);
        }
        break;

      case "MeterValues":
        if (messageType === 2) {
          // Request
          const parsedData = MeterValuesReq.parse(body[3]);
          console.log("Parsed MeterValues.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = MeterValuesConf.parse(body[3]);
          console.log("Parsed MeterValues.conf:", parsedData);
        }
        break;

      case "StartTransaction":
        if (messageType === 2) {
          // Request
          const parsedData = StartTransactionReq.parse(body[3]);
          console.log("Parsed StartTransaction.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = StartTransactionConf.parse(body[3]);
          console.log("Parsed StartTransaction.conf:", parsedData);
        }
        break;

      case "StopTransaction":
        if (messageType === 2) {
          // Request
          const parsedData = StopTransactionReq.parse(body[3]);
          console.log("Parsed StopTransaction.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = StopTransactionConf.parse(body[3]);
          console.log("Parsed StopTransaction.conf:", parsedData);
        }
        break;

      case "RemoteStartTransaction":
        if (messageType === 2) {
          // Request
          const parsedData = RemoteStartTransactionReq.parse(body[3]);
          console.log("Parsed RemoteStartTransaction.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = RemoteStartTransactionConf.parse(body[3]);
          console.log("Parsed RemoteStartTransaction.conf:", parsedData);
        }
        break;

      case "RemoteStopTransaction":
        if (messageType === 2) {
          // Request
          const parsedData = RemoteStopTransactionReq.parse(body[3]);
          console.log("Parsed RemoteStopTransaction.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = RemoteStopTransactionConf.parse(body[3]);
          console.log("Parsed RemoteStopTransaction.conf:", parsedData);
        }
        break;

      case "Reset":
        if (messageType === 2) {
          // Request
          const parsedData = ResetReq.parse(body[3]);
          console.log("Parsed Reset.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = ResetConf.parse(body[3]);
          console.log("Parsed Reset.conf:", parsedData);
        }
        break;

      case "UnlockConnector":
        if (messageType === 2) {
          // Request
          const parsedData = UnlockConnectorReq.parse(body[3]);
          console.log("Parsed UnlockConnector.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = UnlockConnectorConf.parse(body[3]);
          console.log("Parsed UnlockConnector.conf:", parsedData);
        }
        break;

      // Add more actions here as needed
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Return the proper OCPP response array
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
