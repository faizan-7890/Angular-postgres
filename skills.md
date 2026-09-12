# OpsTrack (CMMS) — Technical Skills & Architecture Breakdown

> **Project Overview:**  
> **OpsTrack** is an enterprise-grade Computerized Maintenance Management System (CMMS) engineered to manage physical asset lifecycles, preventative maintenance schedules, technician work orders, and spare parts inventory.

---

## 1. Executive Skills Matrix

| Domain / Tool | Core Competency | Concrete Implementation in OpsTrack | Proficiency Level |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | Relational Modeling & Normalization | 3NF Schema: Assets $\rightarrow$ Schedules $\rightarrow$ Work Orders $\rightarrow$ Technicians $\rightarrow$ Parts | Advanced |
| **PostgreSQL** | Full-Text Search (FTS) | `tsvector` & `tsquery` with GIN indexing for sub-millisecond equipment search | Advanced |
| **PostgreSQL** | ACID Transactions & Concurrency | Atomic inventory decrements via row-locking (`SELECT FOR UPDATE`) & triggers | Advanced |
| **Node.js / Express / NestJS** | Asynchronous Job Scheduling | Background worker queues (BullMQ / node-cron) for automated preventative maintenance | Intermediate - Advanced |
| **Node.js / Express / NestJS** | RESTful API & Architecture | Layered architecture (Controllers, Services, Repositories, DTOs, Zod/Joi validation) | Advanced |
| **Angular & TypeScript** | Reactive State Management | Angular Signals, Computed values, and RxJS pipelines for real-time board updates | Advanced |
| **Angular & TypeScript** | Advanced Component Architecture | Standalone components, CDK Drag & Drop (Kanban board), dynamic forms, route guards | Advanced |
| **Tailwind CSS** | Design Systems & UI Architecture | Custom design tokens, dark/light theme, responsive data grids, print CSS for QR codes | Advanced |
| **Postman** | API Testing & Automation | Automated test assertions (`pm.test`), environment variables, pre-request auth scripts | Advanced |

---

## 2. Deep-Dive Technical Competencies

### A. Database Engineering (PostgreSQL)
* **Relational Schema Design & Data Integrity:**
  * Designed a relational schema enforcing strict foreign key constraints, cascading behaviors (`ON DELETE RESTRICT` for safety), and `ENUM` types for statuses (`PENDING`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`).
  * Structured multi-table relationships:
    * `assets` (1:N) $\rightarrow$ `maintenance_schedules`
    * `maintenance_schedules` (1:N) $\rightarrow$ `work_orders`
    * `work_orders` (N:M via `work_order_parts`) $\rightarrow$ `spare_parts`
    * `technicians` (1:N) $\rightarrow$ `work_orders`
* **Full-Text Search (FTS) Optimization:**
  * Implemented generated `tsvector` columns indexing asset serial numbers, equipment tags, manufacturer specs, and operation manuals.
  * Created Generalized Inverted Indexes (`GIN`) to support fuzzy queries, typo-tolerant prefix searching, and weighted relevance ranking (`ts_rank`).
* **Concurrency & Transactional Integrity:**
  * Prevented race conditions when multiple technicians consume the same spare part simultaneously using explicit transaction blocks (`BEGIN ... COMMIT`) and row-level locking (`SELECT ... FOR UPDATE`).
  * Used database triggers for automatic auditing of asset status changes and downtime calculations.

---

### B. Backend Architecture (Node.js & TypeScript)
* **Scheduled Tasks & Background Processing:**
  * Integrated scheduled cron jobs (`node-cron` / `BullMQ` with Redis) to evaluate recurring maintenance rules (e.g., "every 90 days" or "every 500 operating hours").
  * Automated generation of scheduled work orders and dispatched email/webhook alerts to technicians when maintenance windows approach or breach SLA.
* **API Design & Validation:**
  * Built RESTful endpoints following standard HTTP methods, strict status codes (`200`, `201`, `400`, `404`, `409`, `422`), and consistent error envelope structures.
  * Enforced runtime schema validation on payloads using `Zod` to guarantee type safety from HTTP request boundaries into service layers.
* **Audit & Performance Logging:**
  * Implemented structured logging (Pino/Winston) and request-duration middleware to track database query times and API response latency.

---

### C. Frontend Development (Angular, TypeScript & Tailwind CSS)
* **Modern Angular (v17+ / v18+ / v19+):**
  * Built exclusively using **Standalone Components**, modern control flow syntax (`@if`, `@for`, `@switch`), and the `inject()` function for clean dependency injection.
  * Employed **Angular Signals** (`signal`, `computed`, `effect`) for reactive UI state, minimizing unnecessary change detection cycles compared to legacy `ChangeDetectionStrategy.Default`.
* **Interactive UI & Workflow Visualization:**
  * Leveraged `@angular/cdk/drag-drop` to build an interactive Kanban board allowing managers to transition work order statuses across columns with optimistic UI updates.
  * Integrated client-side barcode / QR code rendering (`qrcode` / `jsbarcode`) for printing physical asset tags and dynamic camera-based QR scanner integration for rapid technician lookup.
* **Design System & Styling with Tailwind CSS:**
  * Crafted a modern, accessible interface with a cohesive color palette, status badge tokens, and micro-interactions.
  * Configured Tailwind `@media print` utilities to generate clean, printer-ready equipment inspection sheets and barcode labels without webpage artifacts.

---

### D. Quality Assurance & API Contract Testing (Postman)
* **Automated API Assertion Suites:**
  * Authored test scripts in Postman (`pm.test`, `pm.expect`) validating:
    * HTTP status codes and response schemas against JSON schemas.
    * Stock decrement correctness: asserting that creating a completed work order with quantity $N$ reduces `spare_parts.stock_quantity` by exactly $N$.
    * Boundary conditions: asserting that consuming more parts than available stock fails with an HTTP `422 Unprocessable Entity`.
* **Environment & Test Lifecycle Management:**
  * Configured multi-stage environments (`Local`, `Staging`, `Production`) using dynamic variables (`{{baseUrl}}`, `{{bearerToken}}`).
  * Configured pre-request scripts to automatically obtain and refresh JWT auth tokens before test runs.
  * Executed end-to-end regression tests via the `Newman` CLI runner for CI/CD integration.

---

## 3. Resume & Portfolio Bullet Points (STAR Format)

### Full Stack Developer / Software Engineer
* **Architected and developed OpsTrack**, a full-stack Asset & Maintenance Management System (CMMS) using **Angular, TypeScript, Node.js, PostgreSQL, and Tailwind CSS**, streamlining maintenance operations and inventory tracking.
* **Engineered high-performance PostgreSQL schema** with relational integrity across 7+ core entities, implementing `tsvector` full-text search with **GIN indexes** to reduce asset search latency by over 75%.
* **Implemented atomic inventory transactions** using PostgreSQL row-level locks (`SELECT FOR UPDATE`), eliminating concurrency race conditions during simultaneous technician parts consumption.
* **Automated preventative maintenance workflows** using Node.js scheduled background workers, generating recurring work orders and sending proactive SLA alert triggers.
* **Built an interactive Kanban board** using **Angular Signals** and **Angular CDK Drag-and-Drop**, providing real-time work order status transitions with optimistic UI updates.
* **Developed automated API test suites in Postman**, validating business rules, authentication lifecycles, and edge cases with 95%+ endpoint test coverage.

---

## 4. Technical Interview Talking Points

### Q1: "Why PostgreSQL over MongoDB for a CMMS?"
> *"A CMMS relies heavily on relational integrity. A work order cannot exist without a valid asset, a technician, and tracked inventory parts. If an asset is decommissioned or stock is depleted, we require foreign key constraints and transactional ACID boundaries to prevent orphaned records and negative inventory balances. PostgreSQL also gives us native full-text search (`tsvector`), eliminating the need to introduce Elasticsearch early on."*

### Q2: "How did you manage state in Angular for the Kanban board?"
> *"I utilized Angular Signals for local component reactivity. The work orders list is stored in a writable signal, while filtered views (e.g., Pending, In Progress, Done) are derived via `computed()`. When a work order is dragged using Angular CDK, the UI optimistically updates the signal immediately, and an asynchronous HTTP request is dispatched. If the backend rejects the change (e.g., due to missing parts), an error effect reverts the signal state back to previous values."*

### Q3: "How did you test business logic in Postman?"
> *"Beyond status checks, I wrote chained integration tests in Postman. For example, in the parts consumption test: 
> 1. Fetch current stock (`GET /parts/:id`) and save quantity to `pm.environment`.
> 2. Submit completed work order (`POST /work-orders/:id/complete`).
> 3. Fetch updated stock and assert: `pm.expect(newStock).to.eql(oldStock - quantityUsed)`."*
