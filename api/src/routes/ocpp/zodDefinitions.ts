import { z } from "zod";

// Define MessageType as a number (2 for request, 3 for response)
const MessageType = z
  .number()
  .int()
  .refine((val) => val === 2 || val === 3, {
    message: "Invalid message type",
  });

// Define Action as an enum of all possible actions
const Action = z.enum([
  "Authorize",
  "BootNotification",
  "StatusNotification",
  "ChangeAvailability",
  "ChangeConfiguration",
  "ClearCache",
  "DataTransfer",
  "GetConfiguration",
  "Heartbeat",
  "MeterValues",
  "StartTransaction",
  "StopTransaction",
  "RemoteStartTransaction",
  "RemoteStopTransaction",
  "Reset",
  "UnlockConnector",
]);

// OCPP message schema as a tuple
export const OCPPMessage = z.tuple([
  MessageType,
  z.string(), // messageId
  Action,
  z.any(), // payload, to be refined later
]);

// ===

/**
 * IdToken - Identifier for authorization.
 */
export const IdToken = z.string(); // Simple string type for IdToken (idTag).

/**
 * Authorize.req - Request sent by the Charge Point to the Central System for authorization.
 */
export const AuthorizeReq = z.object({
  idTag: z.string().min(1), // Required. Identifier to be authorized.
});

/**
 * Authorize.conf - Response sent by the Central System to the Charge Point for authorization.
 */
export const AuthorizeConf = z.object({
  idTagInfo: z.object({
    expiryDate: z.string().optional(), // Optional. Date when the idTag expires.
    parentIdTag: z.string().optional(), // Optional. Parent identifier of the idTag.
    status: z.enum(["Accepted", "Blocked", "Expired", "Invalid"]), // Required. Authorization status.
  }),
});

/**
 * IdTagInfo - Contains information about the idTag authorization status.
 */
export const IdTagInfo = z.object({
  expiryDate: z.string().optional(), // Optional. Expiry date for the idTag.
  parentIdTag: z.string().optional(), // Optional. Parent identifier of the idTag.
  status: z.enum(["Accepted", "Blocked", "Expired", "Invalid"]), // Required. Authorization status.
});

// ===

/**
 * CiString25Type - Case insensitive string of 25 characters.
 */
export const CiString25Type = z
  .string()
  .max(25)
  .transform((value) => value.toLowerCase());

/**
 * CiString20Type - Case insensitive string of 20 characters.
 */
export const CiString20Type = z
  .string()
  .max(20)
  .transform((value) => value.toLowerCase());

/**
 * CiString50Type - Case insensitive string of 50 characters.
 */
export const CiString50Type = z
  .string()
  .max(50)
  .transform((value) => value.toLowerCase());

/**
 * BootNotification.req - Request sent by the Charge Point to the Central System for Boot Notification.
 */
export const BootNotificationReq = z.object({
  chargeBoxSerialNumber: CiString25Type.optional(), // Optional. Serial number of the Charge Box.
  chargePointModel: CiString20Type, // Required. Model of the ChargePoint.
  chargePointSerialNumber: CiString25Type.optional(), // Optional. Serial number of the Charge Point.
  chargePointVendor: CiString20Type, // Required. Vendor of the ChargePoint.
  firmwareVersion: CiString50Type.optional(), // Optional. Firmware version of the Charge Point.
  iccid: CiString20Type.optional(), // Optional. ICCID of the modem’s SIM card.
  imsi: CiString20Type.optional(), // Optional. IMSI of the modem’s SIM card.
  meterSerialNumber: CiString25Type.optional(), // Optional. Serial number of the main electrical meter.
  meterType: CiString25Type.optional(), // Optional. Type of the main electrical meter.
});

/**
 * RegistrationStatus - Status of the registration in the Central System.
 */
export const RegistrationStatus = z.enum(["Accepted", "Rejected", "Pending"]);

/**
 * BootNotification.conf - Response sent by the Central System to the Charge Point for Boot Notification.
 */
export const BootNotificationConf = z.object({
  currentTime: z.string(), // Required. The Central System's current time.
  interval: z.number().int().min(1), // Required. Heartbeat interval or minimum wait time in seconds.
  status: RegistrationStatus, // Required. Registration status of the Charge Point.
});

// ===

/**
 * AvailabilityType - Enumeration for the requested availability change in ChangeAvailability.req.
 */
export const AvailabilityType = z.enum(["Inoperative", "Operative"]);

/**
 * AvailabilityStatus - Enumeration for the status in ChangeAvailability.conf response.
 */
export const AvailabilityStatus = z.enum(["Accepted", "Rejected", "Scheduled"]);

/**
 * ChangeAvailability.req - Request sent by the Central System to the Charge Point for availability change.
 */
export const ChangeAvailabilityReq = z.object({
  connectorId: z.number().int().min(0), // Required. The id of the connector or 0 for all connectors.
  type: AvailabilityType, // Required. The type of availability change (Inoperative or Operative).
});

/**
 * ChangeAvailability.conf - Response sent by the Charge Point to the Central System for availability change.
 */
export const ChangeAvailabilityConf = z.object({
  status: AvailabilityStatus, // Required. The status of the availability change request.
});

// ===

/**
 * CiString500Type - Case insensitive string of 500 characters.
 */
export const CiString500Type = z
  .string()
  .max(500)
  .transform((value) => value.toLowerCase());

export const ChangeConfigurationReq = z.object({
  key: CiString50Type, // Required. The name of the configuration setting to change.
  value: CiString500Type, // Required. The new value for the setting.
});

export const ConfigurationStatus = z.enum([
  "Accepted",
  "Rejected",
  "RebootRequired",
  "NotSupported",
]);

export const ChangeConfigurationConf = z.object({
  status: ConfigurationStatus, // Required. The status of the configuration change.
});

// ===

export const ClearCacheReq = z.object({}); // No fields defined for ClearCache.req

export const ClearCacheStatus = z.enum(["Accepted"]);

export const ClearCacheConf = z.object({
  status: ClearCacheStatus, // Required. The status of the ClearCache request.
});

// ===
/**
 * CiString255Type - Case insensitive string of 255 characters.
 */
export const CiString255Type = z
  .string()
  .max(255)
  .transform((value) => value.toLowerCase());

export const DataTransferReq = z.object({
  vendorId: CiString255Type, // Required. Identifies the Vendor specific implementation.
  messageId: CiString50Type.optional(), // Optional. Additional identification field.
  data: z.string().optional(), // Optional. Data without specified length or format.
});

export const DataTransferStatus = z.enum([
  "Accepted",
  "Rejected",
  "UnknownMessageId",
  "UnknownVendorId",
]);

export const DataTransferConf = z.object({
  status: DataTransferStatus, // Required. The status of the data transfer.
  data: z.string().optional(), // Optional. Data returned in response to the transfer.
});

// ===

export const GetConfigurationReq = z.object({
  key: CiString50Type.array().optional(), // Optional. List of configuration keys for which values are requested.
});

export const KeyValue = z.object({
  key: CiString50Type, // Required. Configuration key.
  readonly: z.boolean(), // Required. Indicates if the key is readonly.
  value: CiString500Type.optional(), // Optional. Configuration value.
});

export const GetConfigurationConf = z.object({
  configurationKey: KeyValue.array().optional(), // Optional. List of known or requested configuration keys.
  unknownKey: CiString50Type.array().optional(), // Optional. List of requested keys that are unknown.
});

// ===

export const HeartbeatReq = z.object({}); // No fields defined for Heartbeat.req

/**
 * Heartbeat.conf - Response sent by the Central System to the Charge Point for Heartbeat.
 */
export const HeartbeatConf = z.object({
  currentTime: z.string(), // Required. Central System's current time.
});

// ===

export const SampledValue = z.object({
  value: z.string(), // Required. Value as raw or signed data.
  context: z.enum(["Start", "End", "Sample", "Periodic"]).optional(), // Optional. Type of measurement context.
  format: z.enum(["Raw", "SignedData"]).optional(), // Optional. Format of the value.
  measurand: z
    .enum([
      "Energy.Active.Import.Register",
      "Energy.Active.Export.Register",
      "Temperature",
      "Current",
    ])
    .optional(), // Optional. Type of measurement.
  phase: z.enum(["L1-N", "L2-N", "L3-N"]).optional(), // Optional. Phase for interpretation of measured value.
  location: z.enum(["Outlet", "Inlet"]).optional(), // Optional. Location of the measurement.
  unit: z.enum(["Wh", "kWh", "A"]).optional(), // Optional. Unit of measure for the value.
});

export const MeterValue = z.object({
  timestamp: z.string(), // Required. Timestamp of the sampled values.
  sampledValue: z.array(SampledValue), // Required. One or more sampled values.
});

export const MeterValuesReq = z.object({
  connectorId: z.number().int().min(0), // Required. Connector ID or 0 for the main powermeter.
  transactionId: z.number().int().optional(), // Optional. The transaction to which the meter samples relate.
  meterValue: z.array(MeterValue), // Required. Meter values with timestamps.
});

export const MeterValuesConf = z.object({}); // No fields defined for MeterValues.conf response

// ===

export const ChargingProfilePurposeType = z.enum([
  "ChargePointMaxProfile",
  "TxDefaultProfile",
  "TxProfile",
]);

export const ChargingProfileKindType = z.enum([
  "Absolute",
  "Recurring",
  "Relative",
]);

export const RecurrencyKindType = z.enum(["Daily", "Weekly"]);

export const ChargingSchedulePeriod = z.object({
  startPeriod: z.number().int().min(1), // Required. Start of the period, in seconds from the start of schedule.
  limit: z.number().min(0), // Required. Charging rate limit during the schedule period.
  numberPhases: z.number().int().optional(), // Optional. Number of phases for charging.
});

export const ChargingSchedule = z.object({
  duration: z.number().int().optional(), // Optional. Duration of the charging schedule in seconds.
  startSchedule: z.string().optional(), // Optional. Starting point of an absolute schedule.
  chargingRateUnit: z.enum(["Amperes", "Watts"]), // Required. The unit of measure for the charging rate.
  chargingSchedulePeriod: z.array(ChargingSchedulePeriod), // Required. List of charging schedule periods.
  minChargingRate: z.number().optional(), // Optional. Minimum charging rate.
});

export const ChargingProfile = z.object({
  chargingProfileId: z.number().int(), // Required. Unique identifier for the profile.
  transactionId: z.number().int().optional(), // Optional. Transaction ID associated with the profile.
  stackLevel: z.number().int().min(0), // Required. Value determining level in the profile stack.
  chargingProfilePurpose: ChargingProfilePurposeType, // Required. Purpose of the charging profile.
  chargingProfileKind: ChargingProfileKindType, // Required. Kind of the charging profile.
  recurrencyKind: RecurrencyKindType.optional(), // Optional. Recurrency kind (Daily, Weekly).
  validFrom: z.string().optional(), // Optional. Point in time when the profile becomes valid.
  validTo: z.string().optional(), // Optional. Point in time when the profile expires.
  chargingSchedule: ChargingSchedule, // Required. The charging schedule.
});

export const RemoteStartTransactionReq = z.object({
  connectorId: z.number().int().min(1).optional(), // Optional. Connector ID for the transaction.
  idTag: z.string(), // Required. The identifier to use for starting the transaction.
  chargingProfile: ChargingProfile.optional(), // Optional. Charging profile for the transaction.
});

export const RemoteStartStopStatus = z.enum(["Accepted", "Rejected"]); // Status for remote start/stop.

export const RemoteStartTransactionConf = z.object({
  status: RemoteStartStopStatus, // Required. Status indicating whether the transaction can be started.
});

// ===

export const RemoteStopTransactionReq = z.object({
  transactionId: z.number().int(), // Required. The transaction ID to stop.
});

export const RemoteStopTransactionConf = z.object({
  status: RemoteStartStopStatus, // Required. Status indicating whether the transaction stop was accepted.
});

// ===

export const ResetStatus = z.enum(["Accepted", "Rejected"]); // Status indicating whether the reset command is accepted.

export const ResetType = z.enum(["Hard", "Soft"]); // Type of reset requested.

export const ResetReq = z.object({
  type: ResetType, // Required. The type of reset that the Charge Point should perform.
});

export const ResetConf = z.object({
  status: ResetStatus, // Required. Status indicating whether the reset was accepted.
});

// ===

export const StartTransactionReq = z.object({
  connectorId: z.number().int().gt(0), // Required. Connector ID used for the transaction.
  idTag: IdToken, // Required. The identifier for the transaction.
  meterStart: z.number().int().min(1), // Required. Meter value in Wh at the start of the transaction.
  reservationId: z.number().int().optional(), // Optional. Reservation ID terminating as a result of this transaction.
  timestamp: z.string(), // Required. Date and time when the transaction is started.
});

export const StartTransactionConf = z.object({
  idTagInfo: IdTagInfo, // Required. Authorization status, expiry, and parent ID.
  transactionId: z.number().int(), // Required. Transaction ID provided by the Central System.
});

// ===

export const ChargePointErrorCode = z.enum([
  "ConnectorLockFailure",
  "EVCommunicationError",
  "GroundFailure",
  "HighTemperature",
  "InternalError",
  "LocalListConflict",
  "NoError",
  "OtherError",
  "OverCurrentFailure",
  "OverVoltage",
  "PowerMeterFailure",
  "PowerSwitchFailure",
  "ReaderFailure",
  "ResetFailure",
  "UnderVoltage",
  "WeakSignal",
]); // Enumeration of Charge Point error codes.

export const ChargePointStatus = z.enum([
  "Available",
  "Preparing",
  "Charging",
  "SuspendedEVSE",
  "SuspendedEV",
  "Finishing",
  "Reserved",
  "Unavailable",
  "Faulted",
]); // Enumeration of Charge Point statuses.

export const StatusNotificationReq = z.object({
  connectorId: z.number().int().min(0), // Required. Connector ID or 0 for main controller.
  errorCode: ChargePointErrorCode, // Required. Reported error code.
  info: CiString50Type.optional(), // Optional. Additional error information.
  status: ChargePointStatus, // Required. Current status of the Charge Point.
  timestamp: z.string().optional(), // Optional. Time of status report.
  vendorId: CiString255Type.optional(), // Optional. Vendor-specific implementation identifier.
  vendorErrorCode: CiString50Type.optional(), // Optional. Vendor-specific error code.
});

export const StatusNotificationConf = z.object({}); // No fields defined for StatusNotification.conf response

// ===

export const Reason = z.enum([
  "DeAuthorized",
  "EmergencyStop",
  "EVDisconnected",
  "HardReset",
  "Local",
  "Other",
  "PowerLoss",
  "Reboot",
  "Remote",
  "SoftReset",
  "UnlockCommand",
]); // Enumeration of reasons for stopping a transaction.

export const StopTransactionReq = z.object({
  idTag: IdToken.optional(), // Optional. Identifier for the transaction to stop.
  meterStop: z.number().int().min(1), // Required. Meter value in Wh at the end of the transaction.
  timestamp: z.string(), // Required. Date and time when the transaction is stopped.
  transactionId: z.number().int(), // Required. Transaction ID from StartTransaction.conf.
  reason: Reason.optional(), // Optional. Reason for stopping the transaction.
  transactionData: z.array(MeterValue).optional(), // Optional. Transaction usage details for billing.
});

export const StopTransactionConf = z.object({
  idTagInfo: IdTagInfo.optional(), // Optional. Authorization status and details.
});

// ===

export const UnlockStatus = z.enum([
  "Unlocked",
  "UnlockFailed",
  "NotSupported",
]); // Enumeration of unlock status responses.

export const UnlockConnectorReq = z.object({
  connectorId: z.number().int().gt(0), // Required. Connector ID to be unlocked.
});

export const UnlockConnectorConf = z.object({
  status: UnlockStatus, // Required. Status indicating whether the connector was successfully unlocked.
});
