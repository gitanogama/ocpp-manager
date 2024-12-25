# ocpp-manager

`ocpp-manager` is a server application designed to handle OCPP (Open Charge Point Protocol) messages from EV chargers. It supports key OCPP operations like `Authorize`, `BootNotification`, `Heartbeat`, and `StatusNotification`, and integrates with a database for storing and managing charger-related data.

## Features

- **OCPP 1.6 Support**: Implements key message handlers for `Authorize`, `BootNotification`, `Heartbeat`, and `StatusNotification`.
- **Database Integration**: Manages chargers, connectors, authorization records, and status updates.
- **Flexible Context Management**: Uses a `GlobalContext` class to track charger-specific metadata across message handlers.
- **WebSocket Communication**: Handles WebSocket-based OCPP message exchanges.

## Getting Started

### Prerequisites

- **Deno**: Ensure you have Deno installed. You can download it from [deno.land](https://deno.land).
- **SQLite**: The application uses SQLite for its database.

### Setup

1. Clone the Repository:

```bash
git clone https://github.com/davbauer/ocpp-manager.git
cd ocpp-manager
```
3. Install Dependencies:

The application uses Deno's module imports, so no explicit installation is required. Ensure your internet connection is active for the first run to cache the dependencies.

4. Running the server

```bash
deno task dev
```

4. Database Schema Initialization:

Generate the database schema using the provided script:
```bash
bash ./src/db/generateSchema.sh
```