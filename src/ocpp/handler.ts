import {
  AuthorizeReq,
  AuthorizeConf,
  BootNotificationReq,
  BootNotificationConf,
  StatusNotificationReq,
  StatusNotificationConf,
  ChangeAvailabilityReq,
  ChangeAvailabilityConf,
  ChangeConfigurationReq,
  ChangeConfigurationConf,
  ClearCacheReq,
  ClearCacheConf,
  DataTransferReq,
  DataTransferConf,
  GetConfigurationReq,
  GetConfigurationConf,
  HeartbeatReq,
  HeartbeatConf,
  MeterValuesReq,
  MeterValuesConf,
  StartTransactionReq,
  StartTransactionConf,
  StopTransactionReq,
  StopTransactionConf,
  RemoteStartTransactionReq,
  RemoteStartTransactionConf,
  RemoteStopTransactionReq,
  RemoteStopTransactionConf,
  ResetReq,
  ResetConf,
  UnlockConnectorReq,
  UnlockConnectorConf,
  OCPPMessage,
} from "./zodDefinitions.ts";

/**
 * This is the endpoint which receives all incoming messages from the charge points.
 */
export const handler = (message: string): Response => {
  try {
    const body = OCPPMessage.parse(JSON.parse(message));

    const messageType = body[0]; // 2 for request, 3 for response
    const action = body[2]; // The action (e.g., "BootNotification")

    // Route the request based on action
    switch (action) {
      case "Authorize":
        if (messageType === 2) {
          // Request
          const parsedData = AuthorizeReq.parse(body[3]);
          console.log("Parsed Authorize.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = AuthorizeConf.parse(body[3]);
          console.log("Parsed Authorize.conf:", parsedData);
        }
        break;

      case "BootNotification":
        if (messageType === 2) {
          // Request
          const parsedData = BootNotificationReq.parse(body[3]);
          console.log("Parsed BootNotification.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = BootNotificationConf.parse(body[3]);
          console.log("Parsed BootNotification.conf:", parsedData);
        }
        break;

      case "StatusNotification":
        if (messageType === 2) {
          // Request
          const parsedData = StatusNotificationReq.parse(body[3]);
          console.log("Parsed StatusNotification.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = StatusNotificationConf.parse(body[3]);
          console.log("Parsed StatusNotification.conf:", parsedData);
        }
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

      case "Heartbeat":
        if (messageType === 2) {
          // Request
          const parsedData = HeartbeatReq.parse(body[3]);
          console.log("Parsed Heartbeat.req:", parsedData);
        } else if (messageType === 3) {
          // Response
          const parsedData = HeartbeatConf.parse(body[3]);
          console.log("Parsed Heartbeat.conf:", parsedData);
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

      default:
        console.error("Unknown action:", action);
        break;
    }

    return new Response("Message processed", { status: 200 });
  } catch (error) {
    console.error("Error processing message:", error);
    return new Response("Failed to process message", { status: 400 });
  }
};
