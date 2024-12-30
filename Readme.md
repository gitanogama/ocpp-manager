# davbauer/ocpp-manager

<div style="text-align: center;">
  <img src="./assets/Logo.svg" alt="OCPP Manager Logo" height="80">
</div>

## Build Status

| Branch | Build Status                                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| main   | ![Build Status - main](https://github.com/davbauer/ocpp-manager/actions/workflows/push-image-main.yml/badge.svg?branch=main) |

## Preview

![Preview](./assets/preview.png)

## Overview

OCPP Manager is an application built with [HonoJS](https://hono.dev/) for the backend and [SvelteKit](https://svelte.dev/) for the frontend.

### Features:

- **Charging Station Management**: Add and monitor charging stations and their associated connectors.
- **RFID Card Setup**: Manage RFID cards, including setting up expiring authorizations to allow or restrict charging.
- **Transaction Records**: Track all transactions and estimate ongoing transaction details.

---

> PS.: This is a very newly created repository and project. If anyone is interested in improving it, contributions would be greatly appreciated!  
> If there are issues or feature ideas, feel free to create an issue or even directly submit a Pull Request.  
> Also, I've been told I’m not the best frontend developer, so improvements to the frontend would be welcome too.

## Docker Compose Example

For a simpler setup, use the following `docker-compose.yml` configuration:

```yaml
services:
  ocpp-manager:
    container_name: ocpp-manager-server
    image: ghcr.io/davbauer/ocpp-manager:latest
    environment:
      DATABASE_URL: postgres://root:password@postgres:5432/app
    volumes:
      - ./logs:/workspace/api/logs
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    restart: unless-stopped
  postgres:
    container_name: ocpp-manager-postgres
    image: postgres:latest
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: password
      POSTGRES_DB: app
    volumes:
      - ./postgres:/var/lib/postgresql/data
    restart: unless-stopped
```

This will pull the latest image of the OCPP Manager from GitHub Container Registry and set up the required PostgreSQL database.

## Development Setup

1. Rename `.env.example` files in both the `app` and `api` directories to `.env`.

2. Install dependencies and build the frontend:

   ```bash
   cd app
   yarn
   yarn build
   cd ../
   ```

3. Start the local development PostgreSQL database:

   ```bash
   cd local
   docker compose up
   ```

4. In a new terminal, apply database migrations and start the API:

   ```bash
   cd api
   yarn
   yarn migrate:run
   yarn dev
   ```

Now you're ready to start developing!
