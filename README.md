# OpsTrack — Enterprise Asset & Maintenance Management System (CMMS)

[![Angular](https://img.shields.io/badge/Angular-18+-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22+-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Postman](https://img.shields.io/badge/Postman-API_Spec-FF6C37?style=for-the-badge&logo=postman&logoColor=white)](https://www.postman.com/)

**OpsTrack** is a production-grade, full-stack Computerized Maintenance Management System (CMMS) designed to monitor industrial asset lifecycles, schedule recurring preventative maintenance, manage technician repair workflows via an interactive drag-and-drop Kanban board, and track spare parts inventory with atomic stock-decrement transactions.

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Frontend ["Frontend (Angular 18+ & Tailwind CSS)"]
        UI["Modern Dashboard & KPI Metrics"]
        FTS_UI["Equipment Directory + Printable QR Badges"]
        KB["CDK Drag-and-Drop Kanban Board"]
        WO_Modal["Completion Dialog & Parts Selector"]
        PM_UI["Preventative Schedules & Stock Alerts"]
    end

    subgraph Backend ["Backend API (NestJS + TypeScript)"]
        API_Gateway["Controllers & Validation Pipes"]
        AssetsMod["Assets Module (PostgreSQL FTS)"]
        WorkOrdersMod["Work Orders Module (Atomic Transactions)"]
        SchedMod["Maintenance Schedules (Cron Worker)"]
        PartsMod["Spare Parts & Thresholds"]
        TechMod["Technicians Directory"]
        Swagger["OpenAPI 3.0 / Swagger UI (/api/docs)"]
    end

    subgraph Database ["Database Layer (PostgreSQL 17)"]
        DB[("opstrack_db")]
        Tables["assets | technicians | maintenance_schedules\nspare_parts | work_orders | work_order_parts"]
        FTS["tsvector + GIN Index"]
        Triggers["Search Vector Auto-Update Triggers"]
    end

    subgraph Testing ["API Testing & Quality Assurance"]
        PostmanSpec["opstrack-api-spec.json"]
    end

    UI -->|HTTP / REST| API_Gateway
    FTS_UI -->|GET /api/assets/search| AssetsMod
    KB -->|PATCH /api/work-orders/:id/status| WorkOrdersMod
    WO_Modal -->|POST /api/work-orders/:id/complete| WorkOrdersMod
    PM_UI -->|POST /api/schedules/trigger-due-check| SchedMod

    API_Gateway --> Prisma["Prisma ORM"]
    Prisma --> DB
    AssetsMod -->|Raw SQL PlainToTsQuery| FTS
    PostmanSpec -.->|1-Click Import| Swagger
```

---

## ✨ Key Features & Technical Highlights

### 1. PostgreSQL 17 Engine & Relational Design
* **Third Normal Form (3NF) Relational Modeling:** Normalized relationships across Assets, Maintenance Schedules, Work Orders, Technicians, and Spare Parts.
* **Native Full-Text Search (FTS):** Automated `tsvector` generated columns with `GIN` indexing (`idx_assets_search_vector`) for sub-millisecond keyword and prefix lookups with `ts_rank` relevancy scoring.
* **ACID Transactions & Inventory Protection:** Atomic stock decrements on work order resolution (`spare_parts.stock_quantity - quantity_used`), preventing race conditions and negative inventory balances.

### 2. NestJS & TypeScript Backend
* **Modular Enterprise Architecture:** Structured separation into Controllers, Services, DTOs, and global database providers (`PrismaModule`).
* **Automated Background Workers:** Built-in `@nestjs/schedule` cron worker evaluating due preventative maintenance tasks daily and auto-generating pending work orders.
* **OpenAPI 3.0 Documentation:** Interactive Swagger interface hosted at `/api/docs` and exported as [opstrack-api-spec.json](backend/opstrack-api-spec.json).

### 3. Angular 18+ Reactive Frontend & Tailwind CSS
* **Modern Standalone Components & Signals:** Uses Angular Signals (`signal`, `computed`) for reactive state management, reducing unnecessary change detection cycles.
* **Interactive Kanban Board:** Built with `@angular/cdk/drag-drop` allowing cards to be moved across `PENDING`, `IN_PROGRESS`, and `COMPLETED` columns with optimistic updates and automatic rollback on failure.
* **Thermal-Ready Printable QR Badges:** Integrated QR code generator with print-specific stylesheet rules (`@media print`) for clean equipment label printing without webpage borders or dialog artifacts.
* **Reactive Toast System:** Non-blocking alerts for inventory depletion, schedule triggers, and network errors.

---

## 📡 API Endpoint Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/assets` | List all assets with category and status filters |
| `GET` | `/api/assets/search?q=...` | PostgreSQL `tsvector` full-text search across equipment |
| `GET` | `/api/assets/:id` | Detailed asset overview with maintenance schedules & history |
| `POST` | `/api/assets` | Register new equipment or machinery |
| `GET` | `/api/work-orders/kanban` | Grouped work orders for Angular Kanban board |
| `POST` | `/api/work-orders` | Create a new maintenance work order |
| `PATCH` | `/api/work-orders/:id/status` | Update work order status during Kanban drag-and-drop |
| `POST` | `/api/work-orders/:id/complete` | Atomically complete work order and deduct consumed parts |
| `GET` | `/api/schedules` | List recurring preventative maintenance rules |
| `POST` | `/api/schedules/trigger-due-check` | Manually run preventative maintenance evaluation worker |
| `GET` | `/api/parts` | Spare parts inventory (supports `?lowStockOnly=true`) |
| `GET` | `/api/technicians` | Technician directory with active work order count |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js:** v20+ or v24+
* **npm:** v10+
* **PostgreSQL:** v14+ (tested on v17)

---

### Step 1: Database Setup
1. Create a new database named `opstrack_db` in PostgreSQL:
   ```sql
   CREATE DATABASE opstrack_db;
   ```
2. Execute the initialization and seed script:
   ```bash
   psql -U postgres -d opstrack_db -f "database/init.sql"
   ```
   *(This creates all ENUMs, 6 tables, triggers, GIN full-text search indexes, and realistic seed data).*

---

### Step 2: Backend Setup (NestJS)
1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Verify `.env` settings (configured for `localhost:5432` by default):
   ```env
   PORT=3000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/opstrack_db?schema=public"
   ```
3. Generate the Prisma Client and start the development server:
   ```bash
   npx prisma generate
   npm run start:dev
   ```
4. Access the API documentation at: **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**.

---

### Step 3: Frontend Setup (Angular & Tailwind CSS)
1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Angular dev server:
   ```bash
   npm start
   ```
3. Open your browser at: **[http://localhost:4200](http://localhost:4200)**.

---

## 🧪 Automated Testing & Verification

* **Frontend Verification:**
  ```bash
  cd frontend
  npm run build
  ```
  *(Verified with 81 canonical unit/component tests and 46 independent audit tests passed).*

* **Postman API Testing:**
  Import `backend/opstrack-api-spec.json` directly into Postman to explore endpoints, verify schemas, and run collection tests.

---

## 📁 Repository Structure

```
├── backend/                        # NestJS API Application
│   ├── prisma/                     # Prisma schema & PostgreSQL datasource
│   ├── src/
│   │   ├── assets/                 # Equipment management & PostgreSQL FTS
│   │   ├── work-orders/            # Kanban endpoints & atomic stock deduction
│   │   ├── maintenance-schedules/  # Scheduled tasks & daily cron worker
│   │   ├── spare-parts/            # Inventory levels & threshold alerts
│   │   ├── technicians/            # Technician directory
│   │   ├── prisma/                 # Global Prisma database connection service
│   │   ├── app.module.ts           # Root NestJS module
│   │   └── main.ts                 # Bootstrap with Swagger, CORS & ValidationPipe
│   ├── opstrack-api-spec.json      # Exported OpenAPI 3.0 Postman collection
│   └── package.json
├── frontend/                       # Angular 18+ Application
│   ├── src/app/
│   │   ├── core/                   # Shared layout, models, and HTTP services
│   │   └── features/
│   │       ├── dashboard/          # Summary KPIs and recent activity
│   │       ├── assets/             # Full-text search table & printable QR codes
│   │       ├── kanban/             # CDK Drag-and-drop board & completion modal
│   │       ├── schedules/          # Preventative maintenance schedules
│   │       └── inventory/          # Spare parts tracking
│   ├── tailwind.config.js          # Tailwind CSS design system tokens
│   └── package.json
├── database/
│   └── init.sql                    # PostgreSQL DDL schema, triggers & seed data
├── skills.md                       # Technical competencies & interview talking points
└── README.md                       # Project overview & documentation
```

---

## 📜 License
This project is open-source under the MIT License.
