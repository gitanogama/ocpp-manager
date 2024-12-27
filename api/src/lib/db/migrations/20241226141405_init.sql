-- Table: chargers
CREATE TABLE chargers (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,              -- Unique charger ID
    serial_number TEXT NOT NULL DEFAULT '',                    -- Unique serial number
    model TEXT NOT NULL DEFAULT '',                            -- Charger model
    vendor TEXT NOT NULL DEFAULT '',                           -- Vendor/manufacturer
    firmware_version TEXT DEFAULT '',                          -- Firmware version
    shortcode TEXT NOT NULL UNIQUE,                            -- User-defined unique identifier
    friendly_name TEXT NOT NULL DEFAULT 'New Charger',         -- User-friendly name
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN (
        'Accepted', 'Pending', 'Rejected'                     -- Charger status values
    )),                                                       
    last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- Timestamp of last heartbeat
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- Timestamp when created
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP    -- Timestamp of the last update
);

-- Table: connectors
CREATE TABLE connectors (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,             -- Unique connector ID
    charger_id INTEGER NOT NULL REFERENCES chargers(id) ON DELETE CASCADE, -- Links to chargers
    connector_id INTEGER NOT NULL,                             -- Connector number
    status TEXT NOT NULL CHECK (status IN (
        'Available', 'Preparing', 'Charging', 'SuspendedEVSE',
        'SuspendedEV', 'Finishing', 'Reserved', 'Unavailable', 'Faulted'
    )) DEFAULT 'Available',                                    -- Connector status
    max_current INTEGER NOT NULL DEFAULT 0,                   -- Maximum current supported
    error_code TEXT DEFAULT '',                               -- Error code
    vendor_error_code TEXT DEFAULT '',                        -- Vendor-specific error
    info TEXT DEFAULT '',                                     -- Additional info
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Timestamp when created
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Timestamp of last update
    UNIQUE(charger_id, connector_id)                         -- Composite unique constraint
);

-- Table: charger_status
CREATE TABLE charger_status (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,             -- Unique status ID
    connector_id INTEGER NOT NULL REFERENCES connectors(id) ON DELETE CASCADE, -- Links to connectors
    status TEXT NOT NULL,                                      -- Connector status
    error_code TEXT DEFAULT '',                               -- Error code (if any)
    vendor_error_code TEXT DEFAULT '',                        -- Vendor-specific error
    heartbeat_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of last heartbeat
    info TEXT DEFAULT '',                                     -- Additional information
    UNIQUE(connector_id, status)                              -- Composite unique constraint
);

-- Table: transactions
CREATE TABLE transactions (
    id  INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,            -- Unique transaction ID
    connector_id INTEGER NOT NULL REFERENCES connectors(id) ON DELETE CASCADE, -- Links to connectors
    transaction_id INTEGER NOT NULL UNIQUE,                    -- Unique OCPP transaction ID
    id_tag TEXT NOT NULL,                                      -- Authorization ID tag
    user_id INTEGER NOT NULL,                                  -- User associated with this transaction
    meter_start INTEGER NOT NULL CHECK (meter_start >= 0),     -- Starting meter reading
    meter_stop INTEGER CHECK (meter_stop >= 0),                -- Ending meter reading
    start_time TIMESTAMP NOT NULL,                             -- Transaction start time
    stop_time TIMESTAMP,                                       -- Transaction stop time
    reason TEXT DEFAULT '',                                    -- Reason for stopping
    status TEXT NOT NULL CHECK (status IN (
        'Active', 'Completed', 'Interrupted', 'Failed'
    )) DEFAULT 'Active',                                       -- Transaction status
    payment_status TEXT NOT NULL CHECK (payment_status IN (
        'Pending', 'Paid', 'Failed'
    )) DEFAULT 'Pending',                                      -- Payment status
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP   -- Timestamp of record creation
);

-- Table: telemetry
CREATE TABLE telemetry (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,             -- Unique telemetry ID
    transaction_id INTEGER NOT NULL REFERENCES transactions(transaction_id) ON DELETE CASCADE, -- Links to transactions
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Telemetry timestamp
    meter_value INTEGER NOT NULL CHECK (meter_value >= 0),    -- Meter reading
    voltage REAL NOT NULL DEFAULT 0.0,                       -- Voltage (V)
    current REAL NOT NULL DEFAULT 0.0,                       -- Current (A)
    sampled_value TEXT DEFAULT '' CHECK (json_valid(sampled_value)) -- JSON-encoded sampled values
);

-- Table: authorization
CREATE TABLE authorization (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,             -- Unique authorization ID
    charger_id INTEGER NOT NULL REFERENCES chargers(id) ON DELETE CASCADE, -- Links to chargers
    id_tag TEXT NOT NULL UNIQUE,                              -- Authorization ID tag
    expiry_date TIMESTAMP DEFAULT NULL,                       -- Expiry date of the authorization
    parent_id_tag TEXT DEFAULT NULL,                          -- Parent ID tag
    status TEXT NOT NULL CHECK (status IN (
        'Accepted', 'Blocked', 'Expired', 'Invalid'
    )),                                                       -- Authorization status
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp of record creation
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP   -- Timestamp of last update
);

-- Table: settings
CREATE TABLE settings (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,             -- Unique settings ID
    system_maintenance BOOLEAN NOT NULL DEFAULT false,        -- Indicates if the system is under maintenance
    heartbeat_interval INTEGER NOT NULL DEFAULT 300          -- Default interval (in seconds) for charger heartbeats
);

-- Insert the initial settings row with default values
INSERT INTO settings (system_maintenance, heartbeat_interval)
VALUES (false, 300);
