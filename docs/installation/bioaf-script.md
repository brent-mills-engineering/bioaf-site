---
layout: docs
title: The bioaf Script
description: Reference guide for all bioaf management script commands.
---

The `bioaf` script is the primary tool for managing your bioAF installation. It handles everything from first-time setup to day-to-day operations — starting and stopping services, running database migrations, creating backups, and more.

All commands are run from the root of your bioAF installation:

```bash
./bioaf <command> [options]
```

---

## First-run

### `setup`

```bash
./bioaf setup
```

The first-time setup command. It's idempotent — safe to re-run. It:

- Checks prerequisites (Docker, Git, Docker Compose)
- Generates a secure `docker/.env` file if one doesn't exist
- Provisions TLS certificates
- Builds all container images
- Starts all services
- Runs database migrations
- Mints a **one-time setup code** and prints it along with the URL of the setup wizard

Open the URL in your browser (usually `https://<vm-ip>/setup`) and paste the code to create your first admin account. The code expires in one hour and is invalidated once the first admin exists. If it expires, re-run `./bioaf setup` to mint a new one.

### `create-admin`

```bash
./bioaf create-admin
```

Creates an additional admin user account interactively. Use this after the first admin has been created via the one-time setup code. Services must already be running. Prompts for organization name, email, and password.

---

## Service management

### `start`

```bash
./bioaf start
```

Starts all services in the correct order: database, backend API, frontend, and web server. Waits for each service to be ready before starting the next.

### `stop`

```bash
./bioaf stop
```

Gracefully stops all services in reverse order.

### `restart`

```bash
./bioaf restart
```

Stops all services, then starts them again. Equivalent to running `stop` followed by `start`.

### `status`

```bash
./bioaf status
```

Shows the current state of each service — running, stopped, or unknown.

### `logs`

```bash
./bioaf logs
./bioaf logs <service>
./bioaf logs <service> -n <lines>
```

Streams live logs from all services, or from a specific service if named. Defaults to the last 100 lines.

| Option | Description |
|--------|-------------|
| `<service>` | One of: `db`, `backend`, `frontend`, `nginx` |
| `-n <lines>` | Number of historical lines to show before streaming (default: 100) |

**Examples:**
```bash
./bioaf logs backend          # Stream backend logs
./bioaf logs backend -n 500   # Stream backend logs, starting from last 500 lines
./bioaf logs nginx            # Stream web server logs
```

### `build`

```bash
./bioaf build
./bioaf build <service>
```

Builds (or rebuilds) container images. Run this after pulling updates or modifying configuration. Optionally specify a single service to build only that image.

---

## Database

### `migrate`

```bash
./bioaf migrate
```

Runs any pending database migrations. Safe to run multiple times — already-applied migrations are skipped. Run this after updating bioAF to apply schema changes.

### `migrate-down`

```bash
./bioaf migrate-down <revision>
```

Downgrades the database schema to a specific revision. Used for rollbacks.

{% include info-bubble.html title="When would I need this?" content="If an update introduces a database change that causes problems, migrate-down lets you roll the schema back to the previous state. You would typically use this alongside reverting the code to the previous version. Only use this if directed to do so during a troubleshooting or rollback procedure." %}

### `backup`

```bash
./bioaf backup
```

Creates a compressed database backup (`pg_dump`) and uploads it to the `bioaf-backups-{project_id}` GCS bucket. The backup file is timestamped, e.g. `bioaf_20260403_142500.sql.gz`. Retention and rotation are configurable in Admin > Backup Settings.

Run this before major updates or any operation that modifies data.

### `reset-db`

```bash
./bioaf reset-db
```

**Destructive.** Drops and recreates the database, then runs migrations from scratch. Requires typing `yes` to confirm. All data is permanently lost.

Use this only during development or to fully reset a broken installation. Not for production use.

---

## Debugging

### `shell`

```bash
./bioaf shell
./bioaf shell <service>
```

Opens an interactive shell inside a running container. Defaults to the `backend` container. Useful for inspecting the running environment or running one-off commands.

| Service | What you get |
|---------|-------------|
| `backend` | Python environment with full app context |
| `frontend` | Node.js environment |
| `db` | Linux shell inside the database container |
| `nginx` | Linux shell inside the web server container |

### `dbshell`

```bash
./bioaf dbshell
```

Opens a direct `psql` session to the database. Useful for inspecting data or running SQL queries directly.

---

## Pipeline

### `register-outputs`

```bash
./bioaf register-outputs
./bioaf register-outputs --run-id <id>
./bioaf register-outputs --force
```

Scans GCS for pipeline output files and registers them in the database. Normally this happens automatically when a pipeline completes — use this command if outputs are missing from the UI or if a pipeline completed without registering its results.

| Option | Description |
|--------|-------------|
| `--run-id <id>` | Register outputs for a specific pipeline run only |
| `--force` | Re-register files that are already in the database |

---

## Maintenance

### `update`

```bash
./bioaf update
./bioaf update <version>
./bioaf update <version> --yes
```

Updates bioAF to a specific version (or the latest GitHub release if omitted). In one step it:

1. Takes a database backup (written to `backups/bioaf_pre_update_<from>_to_<to>_<timestamp>.sql.gz`)
2. Fetches tags and checks out `v<version>`
3. Rebuilds container images
4. Restarts services
5. Runs any new database migrations
6. Records progress in `update-status/current.json` so the web UI can display it in real time

| Argument | Description |
|----------|-------------|
| `<version>` | Target version in `X.Y.Z` form (leading `v` is accepted). Omit to fetch the latest release. |
| `--yes` | Skip the confirmation prompt. Useful for scripts and the in-UI upgrade flow. |
| `BIOAF_AUTO_CONFIRM=1` (env var) | Same effect as `--yes`. |

**Examples:**

```bash
./bioaf update                  # Update to the latest release
./bioaf update 0.7.0            # Update to a specific version
./bioaf update 0.7.0 --yes      # Non-interactive (CI or scripts)
BIOAF_AUTO_CONFIRM=1 ./bioaf update 0.7.0
```

Updates always take a database backup before anything else, so rolling back is a matter of checking out the previous tag and restoring the backup.

### `help`

```bash
./bioaf help
./bioaf -h
./bioaf --help
```

Prints a summary of all available commands with usage examples.
