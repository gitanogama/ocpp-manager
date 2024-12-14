-- Create table for Charging Stations
CREATE TABLE IF NOT EXISTS stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chargeBoxSerialNumber TEXT,
    chargePointModel TEXT NOT NULL,
    chargePointSerialNumber TEXT,
    chargePointVendor TEXT NOT NULL,
    firmwareVersion TEXT,
    iccid TEXT,
    imsi TEXT,
    meterSerialNumber TEXT,
    meterType TEXT
);

-- Create table for Connectors in each station
CREATE TABLE IF NOT EXISTS connectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    connector_id INTEGER NOT NULL CHECK (connector_id > 0), -- Connector ID > 0
    status TEXT CHECK(status IN ('Available', 'Unavailable', 'Faulted', 'Charging')) NOT NULL,
    FOREIGN KEY(station_id) REFERENCES stations(id)
);

-- Create table for Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    connector_id INTEGER NOT NULL,
    idTag TEXT NOT NULL,
    meterStart INTEGER NOT NULL,
    meterStop INTEGER,
    startTimestamp TEXT NOT NULL,
    stopTimestamp TEXT,
    reason TEXT CHECK(reason IN ('DeAuthorized', 'EmergencyStop', 'EVDisconnected', 'HardReset', 'Local', 'Other', 'PowerLoss', 'Reboot', 'Remote', 'SoftReset', 'UnlockCommand')),
    status TEXT CHECK(status IN ('Started', 'Stopped')) NOT NULL,
    FOREIGN KEY(station_id) REFERENCES stations(id),
    FOREIGN KEY(connector_id) REFERENCES connectors(id)
);

-- Create table for Charging Profiles
CREATE TABLE IF NOT EXISTS charging_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL,
    transaction_id INTEGER,
    stack_level INTEGER NOT NULL,
    charging_profile_purpose TEXT CHECK(charging_profile_purpose IN ('ChargePointMaxProfile', 'TxDefaultProfile', 'TxProfile')) NOT NULL,
    charging_profile_kind TEXT CHECK(charging_profile_kind IN ('Absolute', 'Recurring', 'Relative')) NOT NULL,
    recurrency_kind TEXT CHECK(recurrency_kind IN ('Daily', 'Weekly')),
    valid_from TEXT,
    valid_to TEXT,
    charging_schedule TEXT NOT NULL, -- A JSON or TEXT field storing the schedule
    FOREIGN KEY(transaction_id) REFERENCES transactions(id)
);

-- Create table for Authorizations (IdTagInfo)
CREATE TABLE IF NOT EXISTS authorizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idTag TEXT NOT NULL,
    status TEXT CHECK(status IN ('Accepted', 'Blocked', 'Expired', 'Invalid')) NOT NULL,
    expiryDate TEXT,
    parentIdTag TEXT
);

-- Create table for Meter Values
CREATE TABLE IF NOT EXISTS meter_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    sampled_value TEXT NOT NULL, -- A JSON or TEXT field storing the sampled value details
    FOREIGN KEY(transaction_id) REFERENCES transactions(id)
);

-- Create table for Status Notifications (for errors and connector status updates)
CREATE TABLE IF NOT EXISTS status_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    connector_id INTEGER,
    error_code TEXT CHECK(error_code IN ('ConnectorLockFailure', 'EVCommunicationError', 'GroundFailure', 'HighTemperature', 'InternalError', 'LocalListConflict', 'NoError', 'OtherError', 'OverCurrentFailure', 'OverVoltage', 'PowerMeterFailure', 'PowerSwitchFailure', 'ReaderFailure', 'ResetFailure', 'UnderVoltage', 'WeakSignal')) NOT NULL,
    info TEXT,
    status TEXT CHECK(status IN ('Available', 'Unavailable', 'Faulted', 'Charging', 'SuspendedEVSE', 'SuspendedEV', 'Finishing', 'Reserved')) NOT NULL,
    timestamp TEXT,
    vendor_id TEXT,
    vendor_error_code TEXT,
    FOREIGN KEY(station_id) REFERENCES stations(id),
    FOREIGN KEY(connector_id) REFERENCES connectors(id)
);

-- Create table for Reserved Connectors (for ReserveNow)
CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    connector_id INTEGER NOT NULL,
    idTag TEXT NOT NULL,
    parentIdTag TEXT,
    reservation_id INTEGER NOT NULL,
    expiry_date TEXT NOT NULL,
    FOREIGN KEY(connector_id) REFERENCES connectors(id)
);

-- Create table for Firmware Updates
CREATE TABLE IF NOT EXISTS firmware_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('Started', 'InProgress', 'Completed', 'Failed')) NOT NULL,
    progress TEXT, -- Can be a simple string or a percentage
    FOREIGN KEY(station_id) REFERENCES stations(id)
);

-- Create table for Local Authorization List (for SendLocalList)
CREATE TABLE IF NOT EXISTS local_authorization_list (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idTag TEXT UNIQUE NOT NULL,
    list_version INTEGER NOT NULL
);

-- Create table for GetCompositeSchedule
CREATE TABLE IF NOT EXISTS composite_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    connector_id INTEGER NOT NULL,
    schedule_start TEXT, -- Optional, start time of the schedule
    charging_schedule TEXT NOT NULL, -- JSON or TEXT field for energy consumption profile
    FOREIGN KEY(station_id) REFERENCES stations(id),
    FOREIGN KEY(connector_id) REFERENCES connectors(id)
);

-- Table for Configuration Keys
CREATE TABLE IF NOT EXISTS configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL
);
