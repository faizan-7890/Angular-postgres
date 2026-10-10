# PostgreSQL Execution & Operations Plan — OpsTrack CMMS

This guide is a complete, practical setup, configuration, and maintenance plan for running **PostgreSQL** with the OpsTrack CMMS project on Windows.

---

## 📋 Table of Contents
1. [Prerequisites & Verification](#1-prerequisites--verification)
2. [Step-by-Step Installation & PATH Configuration](#2-step-by-step-installation--path-configuration)
3. [Database & Role Provisioning](#3-database--role-provisioning)
4. [Schema Initialization & Full-Text Search (FTS)](#4-schema-initialization--full-text-search-fts)
5. [Connecting the NestJS Backend via Prisma](#5-connecting-the-nestjs-backend-via-prisma)
6. [GUI Management (pgAdmin 4 & DBeaver)](#6-gui-management-pgadmin-4--dbeaver)
7. [PostgreSQL Performance Tuning (postgresql.conf)](#7-postgresql-performance-tuning-postgresqlconf)
8. [Automated Backup & Restore Strategy](#8-automated-backup--restore-strategy)
9. [Troubleshooting Common PostgreSQL Issues](#9-troubleshooting-common-postgresql-issues)

---

## 🔍 1. Prerequisites & Verification

Since you have downloaded PostgreSQL, verify that the service is installed and running on your Windows system.

### Check PostgreSQL Windows Service
Open **PowerShell** and run:
```powershell
Get-Service *postgres*
```

* **Expected Output:**
  ```text
  Status   Name               DisplayName
  ------   ----               -----------
  Running  postgresql-x64-17  postgresql-x64-17 - PostgreSQL Server
  ```

If the status is `Stopped`, start it with:
```powershell
Start-Service postgresql*
```

---

## 🛠️ 2. Step-by-Step Installation & PATH Configuration

PostgreSQL standard installation path on Windows is:
```text
C:\Program Files\PostgreSQL\<version>\bin
```
*(e.g., `C:\Program Files\PostgreSQL\17\bin`)*

### 2.1 Add `psql` to System PATH
To run `psql`, `pg_dump`, and `pg_restore` from any terminal, ensure the `bin` directory is added to your environment `PATH`:

```powershell
# Check if psql is recognized:
Get-Command psql -ErrorAction SilentlyContinue

# If not found, add temporarily to current PowerShell session:
$env:Path += ";C:\Program Files\PostgreSQL\17\bin"

# To add permanently for your user account:
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "User") + ";C:\Program Files\PostgreSQL\17\bin",
    "User"
)
```

### 2.2 Verify CLI Access
```powershell
psql --version
```
*Expected:* `psql (PostgreSQL) 17.x` (or your installed version).

---

## 🗄️ 3. Database & Role Provisioning

### 3.1 Connect to PostgreSQL Superuser
By default, the installer creates the `postgres` superuser on port `5432`.

Connect via PowerShell:
```powershell
# Set password variable for session (replace with your master password):
$env:PGPASSWORD = "postgres"

# Connect:
psql -U postgres -h localhost -p 5432
```

### 3.2 Create the OpsTrack Database
Execute inside `psql` (or directly via PowerShell):

```sql
-- 1. Create the dedicated database
CREATE DATABASE opstrack_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- 2. Verify creation
\l opstrack_db
```

*(Optional Enterprise Best Practice: Create a dedicated non-superuser role)*:
```sql
CREATE USER opstrack_app WITH PASSWORD 'StrongAppPassword2026!';
GRANT ALL PRIVILEGES ON DATABASE opstrack_db TO opstrack_app;
```

---

## ⚡ 4. Schema Initialization & Full-Text Search (FTS)

OpsTrack requires 3 custom ENUMs, 6 relational tables, GIN indexes, and search vector triggers.

### 4.1 Execute Schema & Seed Script (`database/init.sql`)
Run the bundled initialization script directly from PowerShell:

```powershell
cd "C:\Users\Faizan J\Angular-postgres"
$env:PGPASSWORD = "postgres"
psql -U postgres -h localhost -d opstrack_db -f "database\init.sql"
```

### 4.2 Verify Schema Elements
Verify that all objects are created:

```powershell
psql -U postgres -h localhost -d opstrack_db -c "\dt"
```

* **Expected Output:**
  ```text
                   List of relations
   Schema |         Name          | Type  |  Owner   
  --------+-----------------------+-------+----------
   public | assets                | table | postgres
   public | maintenance_schedules | table | postgres
   public | spare_parts           | table | postgres
   public | technicians           | table | postgres
   public | work_order_parts      | table | postgres
   public | work_orders           | table | postgres
  (6 rows)
  ```

Verify custom ENUM types:
```powershell
psql -U postgres -h localhost -d opstrack_db -c "\dT"
```
*Expected:* `asset_status`, `work_order_priority`, `work_order_status`.

Verify PostgreSQL Full-Text Search Index on Assets:
```powershell
psql -U postgres -h localhost -d opstrack_db -c "\d assets"
```
*Expected Index:* `idx_assets_search_vector USING gin (search_vector)`.

---

## 🔌 5. Connecting the NestJS Backend via Prisma

### 5.1 Configure Environment Variables (`backend/.env`)
Navigate to `backend` and ensure `.env` matches your PostgreSQL port and credentials:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/opstrack_db?schema=public"
```

> **Note:** If you set a custom password during installation, replace `postgres:postgres` with `postgres:<YOUR_PASSWORD>`.

### 5.2 Generate Prisma Client
Whenever you connect to a new database or update the schema:

```powershell
cd "C:\Users\Faizan J\Angular-postgres\backend"

# 1. (Optional) Sync schema from live PostgreSQL:
npx prisma db pull

# 2. Generate the typed client:
npx prisma generate
```

### 5.3 Test Connection
Start the NestJS backend to verify successful connection pooling:
```powershell
npm run start:dev
```
Look for:
`[NestApplication] Nest application successfully started`

---

## 🖥️ 6. GUI Management (pgAdmin 4 & DBeaver)

### Using pgAdmin 4 (Bundled with installer):
1. Launch **pgAdmin 4** from the Windows Start Menu.
2. In the left tree, expand **Servers** &rarr; Enter your master password.
3. Expand **Databases** &rarr; **`opstrack_db`** &rarr; **Schemas** &rarr; **public** &rarr; **Tables**.
4. Right-click `assets` &rarr; **View/Edit Data** &rarr; **All Rows** to view equipment records.

### Using DBeaver (Recommended lightweight alternative):
1. Click **New Database Connection** &rarr; **PostgreSQL**.
2. Host: `localhost`, Port: `5432`, Database: `opstrack_db`.
3. Username: `postgres`, Password: `<YOUR_PASSWORD>`.
4. Click **Test Connection** &rarr; **Finish**.

---

## ⚙️ 7. PostgreSQL Performance Tuning (`postgresql.conf`)

Location on Windows:
```text
C:\Program Files\PostgreSQL\17\data\postgresql.conf
```

For smooth performance on development and plant-floor server machines, adjust the following parameters:

| Parameter | Default | Recommended (16GB RAM) | Purpose |
| :--- | :--- | :--- | :--- |
| `shared_buffers` | `128MB` | `2GB` - `4GB` | Dedicated cache for table and index data pages. |
| `work_mem` | `4MB` | `32MB` | Memory per sorting / hash-join operation. |
| `maintenance_work_mem` | `64MB` | `512MB` | Accelerates GIN and B-Tree index creation. |
| `effective_cache_size` | `4GB` | `8GB` - `12GB` | Query planner estimate for OS filesystem cache. |
| `wal_buffers` | `-1` | `16MB` | Buffer for write-ahead log before disk sync. |
| `random_page_cost` | `4.0` | `1.1` | Optimized for modern NVMe / SSD drives. |

*(Restart the service after modifying `postgresql.conf`: `Restart-Service postgresql-x64-17`)*.

---

## 💾 8. Automated Backup & Restore Strategy

### 8.1 Create a Full Compressed Database Dump
Run from PowerShell:

```powershell
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "C:\Users\Faizan J\Angular-postgres\database\backup_opstrack_$timestamp.dump"

$env:PGPASSWORD = "postgres"
pg_dump -U postgres -h localhost -p 5432 -d opstrack_db -F c -b -v -f $backupFile

Write-Output "Backup saved to: $backupFile"
```

### 8.2 Restore from a Dump File
To restore or migrate to a new machine:

```powershell
# 1. Drop existing database and recreate clean target:
psql -U postgres -h localhost -c "DROP DATABASE IF EXISTS opstrack_db;"
psql -U postgres -h localhost -c "CREATE DATABASE opstrack_db;"

# 2. Restore schema, tables, triggers, and data:
pg_restore -U postgres -h localhost -d opstrack_db -v "path\to\your_backup.dump"
```

### 8.3 Reset to Clean Default State
To reset the development database to default sample data at any time:
```powershell
psql -U postgres -h localhost -d opstrack_db -f "database\init.sql"
```

---

## 🚨 9. Troubleshooting Common PostgreSQL Issues

### Issue 1: `psql: error: fe_sendauth: no password supplied`
* **Cause:** PostgreSQL requires authentication on Windows localhost (`::1` or `127.0.0.1`).
* **Fix:** Either supply the password via environment variable:
  ```powershell
  $env:PGPASSWORD = "your_password"
  psql -U postgres -d opstrack_db
  ```
  Or edit `C:\Program Files\PostgreSQL\17\data\pg_hba.conf` and change `scram-sha-256` to `trust` for local loopback (development only).

### Issue 2: `Port 5432 is already in use`
* **Cause:** Another instance of PostgreSQL or Docker container is bound to port 5432.
* **Diagnose:**
  ```powershell
  Get-NetTCPConnection -LocalPort 5432 | Select-Object OwningProcess, State
  ```
* **Fix:** Stop the competing service or edit `port = 5433` in `postgresql.conf` and update `backend/.env`.

### Issue 3: `Database "opstrack_db" does not exist`
* **Fix:** Run `psql -U postgres -c "CREATE DATABASE opstrack_db;"` followed by step 4 to load `database/init.sql`.

---

## 🎯 Summary Execution Checklist

- [ ] Verify service is running: `Get-Service *postgres*`
- [ ] Add PostgreSQL bin directory to PATH: `psql --version`
- [ ] Create database: `CREATE DATABASE opstrack_db;`
- [ ] Initialize schema: `psql -d opstrack_db -f "database/init.sql"`
- [ ] Check `backend/.env` connection string
- [ ] Run backend Prisma generator: `npx prisma generate`
- [ ] Boot app: `npm run start:dev` (backend) & `npm start` (frontend)
