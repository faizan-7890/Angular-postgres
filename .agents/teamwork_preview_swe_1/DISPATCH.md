## 2026-09-12T17:20:25Z
<USER_REQUEST>
You are the SWE Light Orchestrator for OpsTrack CMMS frontend development.
Your working directory is: c:\Users\Faizan J\FBD\.agents\teamwork_preview_swe_1
The authoritative user request is recorded at: c:\Users\Faizan J\FBD\.agents\ORIGINAL_REQUEST.md

Task Details:
Target working directory for the code: c:\Users\Faizan J\FBD\frontend
Integrity mode: demo
Verification Resources:
- Live Backend API: http://localhost:3000
- Swagger Documentation: http://localhost:3000/api/docs
- OpenAPI 3.0 Specification: c:\Users\Faizan J\FBD\backend\opstrack-api-spec.json
- Backend Source Code: c:\Users\Faizan J\FBD\backend

Requirements:
R1. Responsive Modern Dashboard & Layout:
Enterprise dashboard layout using Tailwind CSS. Sidebar navigation links (Dashboard, Assets, Work Orders Kanban, Maintenance Schedules, Spare Parts Inventory), top status summary cards (Total Assets, Active Work Orders, Overdue Tasks, Low Stock Alerts), Angular Standalone Components with Signals for reactive state.

R2. Asset Directory with Full-Text Search & Printable QR Badges:
Equipment directory view featuring:
- Live search debounced input connected to GET /api/assets/search?q=...
- Category and status filter dropdowns
- Detailed modal/view showing equipment metadata and maintenance history
- Printable QR code badge generation using qrcode with print-optimized CSS (@media print) so physical asset tags can be printed without layout artifacts.

R3. Interactive Work Order Kanban Board:
Drag-and-drop Kanban board for work order workflows:
- Three columns: PENDING, IN_PROGRESS, COMPLETED
- Built with @angular/cdk/drag-drop allowing cards to be moved across columns
- State transitions update local Angular Signals optimistically and dispatch PATCH /api/work-orders/:id/status to the backend
- Reverts column position with user-facing toast notification if the API call fails.

R4. Work Order Completion & Parts Consumption Flow:
Completion dialog for work orders:
- Allows selecting spare parts used during the repair and specifying quantities
- Submits to POST /api/work-orders/:id/complete to atomically deduct inventory
- Handles insufficient stock errors gracefully with clear user feedback.

R5. Preventative Schedules & Spare Parts Inventory:
- Schedules view displaying upcoming recurring maintenance tasks and an action button to trigger the maintenance check worker (POST /api/schedules/trigger-due-check)
- Inventory table listing spare parts with stock badges highlighting low-stock items (stock_quantity <= min_threshold).

Acceptance Criteria:
- Angular project compiles with zero TypeScript errors via `npm run build`.
- Dependencies include @angular/cdk, tailwindcss, and lucide-angular (or equivalent icon set).
- Interacts directly with http://localhost:3000/api without CORS or HTTP payload errors.
- Full-text asset search retrieves and renders matches from the PostgreSQL backend dynamically.
- Drag-and-drop on the Kanban board persists status updates to the NestJS API.
- Completing a work order successfully decrements spare parts stock and advances maintenance schedules.

Maintain your progress.md and BRIEFING.md in your working directory. When all work and verification is completed, report completion back with a structured summary of changes and verification evidence.
</USER_REQUEST>
