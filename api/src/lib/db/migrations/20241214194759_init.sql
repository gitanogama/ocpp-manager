-- Table: chargers
CREATE TABLE chargers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,             -- Unique charger ID
    serial_number TEXT NOT NULL UNIQUE,               -- Unique serial number of the charger
    model TEXT NOT NULL,                              -- Charger model
    vendor TEXT NOT NULL,                             -- Vendor/manufacturer of the charger
    firmware_version TEXT,                            -- Firmware version
    registration_status TEXT CHECK (registration_status IN (
        'Pending', 'Accepted', 'Rejected'
    )) DEFAULT 'Pending',                             -- Registration status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   -- Timestamp when created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP    -- Timestamp of the last update
);

-- Table: connectors
CREATE TABLE connectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,             -- Unique connector ID
    charger_id INTEGER NOT NULL REFERENCES chargers(id) ON DELETE CASCADE, -- Links to chargers
    connector_id INTEGER NOT NULL,                    -- Connector number (OCPP's `connectorId`)
    status TEXT NOT NULL CHECK (status IN (
        'Available', 'Preparing', 'Charging', 'SuspendedEVSE',
        'SuspendedEV', 'Finishing', 'Reserved', 'Unavailable', 'Faulted'
    )) DEFAULT 'Available',                           -- Connector status
    error_code TEXT CHECK (error_code IN (
        'ConnectorLockFailure', 'EVCommunicationError', 'GroundFailure',
        'HighTemperature', 'InternalError', 'LocalListConflict', 'NoError',
        'OtherError', 'OverCurrentFailure', 'OverVoltage', 'PowerMeterFailure',
        'PowerSwitchFailure', 'ReaderFailure', 'ResetFailure', 'UnderVoltage', 'WeakSignal'
    )),                                               -- Last error reported
    vendor_error_code TEXT,                           -- Vendor-specific error code
    info TEXT,                                        -- Additional information about the connector
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   -- Timestamp when created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   -- Timestamp of the last update
    UNIQUE(charger_id, connector_id)                 -- Composite unique constraint
);

-- Table: charger_status
CREATE TABLE charger_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,             -- Unique status ID
    connector_id INTEGER NOT NULL REFERENCES connectors(id) ON DELETE CASCADE, -- Links to connectors
    status TEXT NOT NULL CHECK (status IN (
        'Available', 'Preparing', 'Charging', 'SuspendedEVSE',
        'SuspendedEV', 'Finishing', 'Reserved', 'Unavailable', 'Faulted'
    )),                                               -- Connector status
    error_code TEXT,                                  -- Error code (if any)
    vendor_error_code TEXT,                           -- Vendor-specific error code (if any)
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Timestamp of the status update
    info TEXT,                                        -- Additional information
    UNIQUE(connector_id, status)                      -- Composite unique constraint
);

-- Table: transactions
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,             -- Unique transaction ID
    connector_id INTEGER NOT NULL REFERENCES connectors(id) ON DELETE CASCADE, -- Links to connectors
    transaction_id INTEGER NOT NULL UNIQUE,           -- Unique OCPP transaction ID
    id_tag TEXT NOT NULL,                             -- Authorization ID tag
    meter_start INTEGER CHECK (meter_start >= 0),     -- Starting meter reading (in Wh)
    meter_stop INTEGER CHECK (meter_stop >= 0),       -- Ending meter reading (in Wh)
    start_time TIMESTAMP NOT NULL,                    -- Timestamp when transaction started
    stop_time TIMESTAMP,                              -- Timestamp when transaction ended
    reason TEXT CHECK (reason IN (
        'DeAuthorized', 'EmergencyStop', 'EVDisconnected', 'HardReset', 
        'Local', 'Other', 'PowerLoss', 'Reboot', 'Remote', 'SoftReset', 'UnlockCommand'
    )),                                               -- Reason for stopping the transaction
    status TEXT CHECK (status IN (
        'Active', 'Completed', 'Interrupted', 'Failed'
    )) DEFAULT 'Active',                              -- Transaction status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP    -- Timestamp when the record was created
);

-- Table: telemetry
CREATE TABLE telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,             -- Unique telemetry data ID
    transaction_id INTEGER NOT NULL REFERENCES transactions(transaction_id) ON DELETE CASCADE, -- Links to transactions
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Timestamp of the telemetry data
    meter_value INTEGER CHECK (meter_value >= 0),     -- Meter reading (in Wh)
    sampled_value TEXT CHECK (json_valid(sampled_value)) -- JSON-encoded sampled values
);

-- Table: authorization
CREATE TABLE authorization (
    id INTEGER PRIMARY KEY AUTOINCREMENT,             -- Unique authorization ID
    charger_id INTEGER NOT NULL REFERENCES chargers(id) ON DELETE CASCADE, -- Links to chargers
    id_tag TEXT NOT NULL UNIQUE,                      -- ID tag for authorization
    expiry_date TIMESTAMP,                            -- Expiry date of the authorization
    parent_id_tag TEXT,                               -- Parent ID tag (if applicable)
    status TEXT CHECK (status IN (
        'Accepted', 'Blocked', 'Expired', 'Invalid'
    )) NOT NULL,                                      -- Authorization status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   -- Timestamp when created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP    -- Timestamp of the last update
);
