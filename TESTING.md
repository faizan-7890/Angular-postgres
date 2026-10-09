# OpsTrack CMMS — Comprehensive QA & Verification Test Plan

This document outlines the end-to-end test suites, verification steps, and expected outcomes for testing the **OpsTrack Enterprise CMMS** ([Angular 18](https://angular.dev/) + [NestJS](https://nestjs.com/) + [PostgreSQL 17](https://www.postgresql.org/)).

---

## 🚀 1. Environment Startup & Pre-flight Checks

Before beginning the test sessions, ensure all three tiers (Database, Backend, and Frontend) are running.

### 1.1 PostgreSQL Database
Verify that the PostgreSQL 17 service is active:
```powershell
Get-Service postgresql-x64-17
```
*Expected Status:* `Running`.

*(If needed, start it via `Start-Service postgresql-x64-17`)*.

### 1.2 NestJS Backend Server
Open **Terminal 1**:
```powershell
cd "C:\Users\Faizan J\Angular-postgres\backend"
npm run start:dev
```
*Expected Output:*
* `OpsTrack Backend is running on: http://localhost:3000`
* `Swagger OpenAPI Documentation: http://localhost:3000/api/docs`

### 1.3 Angular Frontend Server
Open **Terminal 2**:
```powershell
cd "C:\Users\Faizan J\Angular-postgres\frontend"
npm start
```
*Expected Output:*
* `Local: http://localhost:4200/`

---

## 🧪 2. Phase 2 Features Test Suite

### Test Suite 2.1: Light & Dark Mode Theming
* **Goal:** Verify that theme switching works seamlessly, persists across sessions, and maintains high contrast.

| Step | Action | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :--- |
| **2.1.1** | Navigate to `http://localhost:4200`. Observe the default theme. | App defaults to Dark theme (`bg-slate-950`), matching enterprise industrial style. | [ ] |
| **2.1.2** | Click the **Light** button with the ☀️ Sun icon in the top header. | The entire application transitions smoothly to clean Light mode (`bg-slate-100`, white cards, crisp slate borders, dark text). | [ ] |
| **2.1.3** | Refresh the browser (`F5` or `Ctrl+R`). | The application reloads directly in **Light mode** without flashing dark theme (persisted in `localStorage`). | [ ] |
| **2.1.4** | Click the **Dark** button with the 🌙 Moon icon in the header. | The application transitions back to Dark mode smoothly. | [ ] |
| **2.1.5** | Check all views (Dashboard, Assets, Kanban, Schedules, Inventory) in both modes. | All text, tables, modals, badges, and card borders remain easily readable with proper contrast (no invisible text). | [ ] |

---

### Test Suite 2.2: Dashboard Visual KPI Charts & Health Strip
* **Goal:** Verify interactive SVG charts, dynamic calculations, and reactive signals on the Dashboard.

| Step | Action | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :--- |
| **2.2.1** | Navigate to `/dashboard`. Inspect the 4 KPI cards at the top. | Displays: Total Assets, Active Work Orders, Overdue Tasks, and Low Stock Alerts. | [ ] |
| **2.2.2** | Inspect the **KPI Health & Compliance Strip** right below the top cards. | Displays 4 progress bars: **Fleet Availability %**, **PM Compliance %**, **Resolution Rate %**, and **Inventory Health %**. | [ ] |
| **2.2.3** | Inspect the **Work Orders Distribution Donut Chart**. | Renders an interactive SVG ring chart with slices representing order counts. Total tickets count is displayed in the center. | [ ] |
| **2.2.4** | Hover over individual donut slices or items in the legend. | Center text dynamically updates to show the selected label, count, and calculated percentage (e.g. `IN_PROGRESS 3 60%`). | [ ] |
| **2.2.5** | Click the **By Priority** toggle button above the donut chart. | Donut chart smoothly recalculates and updates slices by urgency: `Critical`, `High`, `Medium`, and `Low`. | [ ] |
| **2.2.6** | Click back to **By Status**. | Donut chart switches back to lifecycle breakdown (`Pending`, `In Progress`, `Completed`). | [ ] |
| **2.2.7** | Inspect the **Fleet Equipment Health Bar Chart**. | Shows breakdown across machinery categories (Pneumatics, Cooling, Heavy Machinery, etc.) with operational vs maintenance progress segments. | [ ] |

---

### Test Suite 2.3: Preventative Maintenance Calendar & Timeline
* **Goal:** Verify the Month Grid calendar view, timeline agenda, date arithmetic, and task inspection.

| Step | Action | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :--- |
| **2.3.1** | Navigate to `/schedules`. Click **Calendar & Timeline** on the view switcher. | Switches from the traditional table view to the interactive Month Calendar Grid. | [ ] |
| **2.3.2** | Inspect the Month Grid header and navigation controls. | Current Month and Year are displayed (e.g., October 2026). Days of the week (Sun - Sat) form 7 columns. | [ ] |
| **2.3.3** | Verify the **Today** indicator. | Today's day cell is highlighted with a blue badge/border ring. | [ ] |
| **2.3.4** | Click the `<` (Previous Month) and `>` (Next Month) buttons. | Calendar smoothly recalculates the grid days and shifts the visible month. Clicking **Today** resets back to current month. | [ ] |
| **2.3.5** | Inspect task pills within the day cells. | Tasks scheduled on specific days appear as pill chips. Color coding: 🔴 Overdue, 🟡 Due Soon, 🔵 Scheduled. | [ ] |
| **2.3.6** | Click on any task chip within a day cell. | A **Schedule Details Dialog** opens showing task name, equipment name, serial number, recurrence frequency, and next due date. | [ ] |
| **2.3.7** | Close the modal and switch the toggle to **Timeline Agenda**. | Displays a chronological vertical milestone feed with status node dots, equipment location, and a "Details" button. | [ ] |
| **2.3.8** | Switch back to **Table View**. | Schedule records render in the full data table with status pills. | [ ] |

---

## ⚙️ 3. Core Operational Workflows Test Suite

### Test Suite 3.1: Equipment Directory & Full-Text Search (FTS)
* **Goal:** Verify PostgreSQL `tsvector` + GIN index search and QR badge thermal printing.

| Step | Action | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :--- |
| **3.1.1** | Navigate to `/assets`. Type `Compressor` in the search bar. | Table debounces input (~300ms) and queries `/api/assets/search?q=Compressor`, returning matching equipment. | [ ] |
| **3.1.2** | Type `Bay 4` or `Roof` in the search bar. | PostgreSQL full-text search matches locations and attributes accurately. | [ ] |
| **3.1.3** | Filter by **Category** (e.g. `Cooling & Ventilation`) and **Status** (`OPERATIONAL`). | List filters correctly. Click **Reset** to restore full fleet view. | [ ] |
| **3.1.4** | Click the **QR Code icon** on any asset row. | Modal opens displaying a generated QR code containing the asset's serial number and technical specs. | [ ] |
| **3.1.5** | Click **Print Thermal Tag** (`Ctrl+P`). | Print preview opens using `@media print` styling: prints only the equipment badge cleanly without navigation or webpage headers. | [ ] |
| **3.1.6** | Click **Register Equipment**. Submit a new machine with serial number `TEST-PUMP-99`. | Equipment is added to PostgreSQL and immediately shows in the table. | [ ] |

---

### Test Suite 3.2: Kanban Drag-and-Drop & Status Transitions
* **Goal:** Verify `@angular/cdk/drag-drop` mechanics, optimistic updates, and rollback integrity.

| Step | Action | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :--- |
| **3.2.1** | Navigate to `/kanban`. Observe columns: **Pending**, **In Progress**, **Completed**. | Active tickets are grouped in their respective columns with count badges. | [ ] |
| **3.2.2** | Drag a card from **Pending** to **In Progress**. | Card moves smoothly; backend endpoint `PATCH /api/work-orders/:id/status` is called with `status: "IN_PROGRESS"`. Card remains in target column. | [ ] |
| **3.2.3** | Drag a card from **In Progress** to **Pending**. | Status updates back to `PENDING` with instant UI update. | [ ] |
| **3.2.4** | Use the Priority filter dropdown (e.g. select `CRITICAL`). | Only critical work orders remain visible across columns. | [ ] |
| **3.2.5** | Click **Create Work Order**. Select an asset, technician, and priority. Submit. | New card appears in the **Pending** column. | [ ] |

---

### Test Suite 3.3: Work Order Resolution & Atomic Parts Decrement
* **Goal:** Verify ACID stock deduction preventing negative balances and race conditions.

| Step | Action | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :--- |
| **3.3.1** | Navigate to `/inventory`. Check current stock of a spare part (e.g. *Air Filter AF-220*, note initial quantity $Q$). | Stock quantity is noted (e.g. 15). | [ ] |
| **3.3.2** | Go to `/kanban`. Find an **In Progress** card. Click **Complete &rarr;** on the card. | **Complete Work Order** dialog opens. | [ ] |
| **3.3.3** | Enter resolution notes (e.g. *"Replaced filter, calibrated pressure valve"*). | Input accepted. | [ ] |
| **3.3.4** | Click **+ Add Spare Part**. Select the part from Step 3.3.1 and set quantity used to `2`. | Consumed parts row is added. | [ ] |
| **3.3.5** | Click **Complete & Deduct Stock**. | Order moves to **Completed** column. Toast notification confirms resolution. | [ ] |
| **3.3.6** | Navigate to `/inventory`. Check the part's stock quantity. | Stock has decremented atomically to $Q - 2$ (e.g. 13). | [ ] |
| **3.3.7** | *(Edge Case)* Attempt to complete another order consuming more parts than available in stock. | Backend rejects transaction with `400 Bad Request` ("Insufficient stock"); inventory is NOT decremented (ACID protection). | [ ] |

---

### Test Suite 3.4: Automated Preventative Maintenance Due-Check Worker
* **Goal:** Verify manual and cron background evaluation of scheduled maintenance rules.

| Step | Action | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :--- |
| **3.4.1** | On `/dashboard` or `/schedules`, click the **Trigger Due Check** button. | Button shows spinner (`Evaluating PM Tasks...`). Calls `POST /api/schedules/trigger-due-check`. | [ ] |
| **3.4.2** | Check toast message upon completion. | Toast displays: *"Preventative check complete: X work order(s) generated"*. | [ ] |
| **3.4.3** | Navigate to `/kanban`. | Any newly generated maintenance orders appear in the **Pending** column. | [ ] |

---

## 🔌 4. API Sanity Tests Matrix

You can run these curl commands in PowerShell to verify backend endpoints directly:

```powershell
# 1. Health check & Asset List
Invoke-RestMethod -Uri "http://localhost:3000/api/assets" -Method Get | Select-Object -First 1

# 2. PostgreSQL Full-Text Search
Invoke-RestMethod -Uri "http://localhost:3000/api/assets/search?q=Compressor" -Method Get

# 3. Kanban Board Grouping
Invoke-RestMethod -Uri "http://localhost:3000/api/work-orders/kanban" -Method Get

# 4. Spare Parts Inventory (Low stock filter)
Invoke-RestMethod -Uri "http://localhost:3000/api/parts?lowStockOnly=true" -Method Get

# 5. Preventative Schedules List
Invoke-RestMethod -Uri "http://localhost:3000/api/schedules" -Method Get
```

Or open the interactive Swagger UI at **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)** to test all endpoints with 1-click execution.

---

## 📝 5. QA Sign-Off Checklist

* [ ] **Theme Switcher:** Light, Dark, and OS system themes verified without styling regressions.
* [ ] **Dashboard KPI Charts:** Donut and Category charts interactive and accurate.
* [ ] **Maintenance Calendar:** Month grid navigation and timeline view functioning.
* [ ] **Assets & QR:** Full-text search verified and QR badges print-ready.
* [ ] **Kanban Board:** Drag-and-drop state transitions persist without error.
* [ ] **Atomic Inventory:** Work order completion decrements stock correctly.
* [ ] **Cron Worker:** Schedule evaluation triggers and creates pending work orders.

**Tester:** `____________________`  
**Date Tested:** `____________________`  
**Status:** `[ ] PASSED` / `[ ] ISSUES FOUND`
