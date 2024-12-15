-- Table: chargers
-- Stores information about each charger in the system.
CREATE TABLE chargers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,             -- Unique identifier for the charger
    serial_number TEXT NOT NULL UNIQUE,               -- Unique serial number of the charger
    model TEXT NOT NULL,                              -- Model of the charger
    vendor TEXT NOT NULL,                             -- Vendor of the charger
    firmware_version TEXT,                            -- Firmware version of the charger
    registration_status TEXT CHECK (registration_status IN ('Pending', 'Accepted', 'Rejected')) DEFAULT 'Pending', -- Status of the charger's registration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   -- Timestamp when the charger was registered
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP    -- Timestamp of the last update
);

-- Table: charger_auth
-- Stores authentication details for chargers.
CREATE TABLE charger_auth (
    id INTEGER PRIMARY KEY AUTOINCREMENT,             -- Unique identifier for the auth record
    charger_id INTEGER NOT NULL REFERENCES chargers(id) ON DELETE CASCADE, -- Foreign key to chargers table
    id_tag TEXT NOT NULL UNIQUE,                      -- ID tag for authorization
    expiry_date TIMESTAMP,                            -- Expiry date of the ID tag
    parent_id_tag TEXT,                               -- Parent ID tag, if applicable
    status TEXT CHECK (status IN ('Accepted', 'Blocked', 'Expired', 'Invalid')) NOT NULL, -- Status of the ID tag
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   -- Timestamp when the auth was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP    -- Timestamp of the last update
);

-- Table: charger_status
-- Stores the latest status information sent by each charger.
CREATE TABLE charger_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,             -- Unique identifier for the status record
    charger_id INTEGER NOT NULL REFERENCES chargers(id) ON DELETE CASCADE, -- Foreign key to chargers table
    status TEXT NOT NULL CHECK (status IN (
        'Available', 'Preparing', 'Charging', 'SuspendedEVSE', 
        'SuspendedEV', 'Finishing', 'Reserved', 'Unavailable', 'Faulted'
    )),                                               -- Current status of the charger
    error_code TEXT CHECK (error_code IN (
        'ConnectorLockFailure', 'EVCommunicationError', 'GroundFailure',
        'HighTemperature', 'InternalError', 'LocalListConflict', 'NoError',
        'OtherError', 'OverCurrentFailure', 'OverVoltage', 'PowerMeterFailure',
        'PowerSwitchFailure', 'ReaderFailure', 'ResetFailure', 'UnderVoltage', 'WeakSignal'
    )),                                               -- Last error reported (if any)
    info TEXT,                                        -- Additional information about the status
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Timestamp of the status update
    vendor_error_code TEXT                            -- Vendor-specific error code (if any)
);

-- Table: charger_data
-- Stores detailed telemetry data from chargers (e.g., meter values, sampled values).
CREATE TABLE charger_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,             -- Unique identifier for the data record
    charger_id INTEGER NOT NULL REFERENCES chargers(id) ON DELETE CASCADE, -- Foreign key to chargers table
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Timestamp of the data point
    meter_start INTEGER CHECK (meter_start >= 0),     -- Meter reading at the start of the transaction (Wh)
    meter_stop INTEGER CHECK (meter_stop >= 0),       -- Meter reading at the end of the transaction (Wh)
    sampled_value TEXT,                               -- JSON-encoded array of sampled values
    transaction_id INTEGER                            -- Associated transaction ID (if applicable)
);

-- Table: charger_transactions
-- Stores transactional information about charging sessions.
CREATE TABLE charger_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,             -- Unique identifier for the transaction
    charger_id INTEGER NOT NULL REFERENCES chargers(id) ON DELETE CASCADE, -- Foreign key to chargers table
    transaction_id INTEGER NOT NULL UNIQUE,           -- Unique transaction ID
    id_tag TEXT NOT NULL,                             -- ID tag associated with the transaction
    meter_start INTEGER CHECK (meter_start >= 0),     -- Meter reading at the start of the transaction (Wh)
    meter_stop INTEGER CHECK (meter_stop >= 0),       -- Meter reading at the end of the transaction (Wh)
    start_time TIMESTAMP NOT NULL,                    -- Timestamp when the transaction started
    stop_time TIMESTAMP,                              -- Timestamp when the transaction stopped
    reason TEXT CHECK (reason IN (
        'DeAuthorized', 'EmergencyStop', 'EVDisconnected', 'HardReset', 
        'Local', 'Other', 'PowerLoss', 'Reboot', 'Remote', 'SoftReset', 'UnlockCommand'
    )),                                               -- Reason for stopping the transaction (if any)
    status TEXT CHECK (status IN ('Active', 'Completed', 'Interrupted', 'Failed')) DEFAULT 'Active', -- Transaction status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP    -- Timestamp when the transaction was created
);
