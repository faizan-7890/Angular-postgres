# OpsTrack CMMS Frontend - Round 3 Adversarial Review Handoff

## Summary of Findings & Critical Fixes

### 1. Broken Signal Reactivity in Kanban and Inventory Filter Controls
- **Problem:** In `kanban.component.ts` (`filterQuery`, `selectedPriority`) and `inventory.component.ts` (`searchQuery`), filter state variables were defined as plain mutable properties instead of Angular Signals (`signal<string>('')`).
- **Failure Mode:** `computed()` in Angular 18/19 tracks Signal reads to establish its reactive dependency graph and memoize outputs. When plain variables changed via input bindings, the `computed()` signals (`filteredPending`, `filteredInProgress`, `filteredCompleted`, `filteredParts`) were never marked dirty. Angular returned stale cached results, completely breaking real-time search and priority filtering in the browser.
- **Fix:** Refactored `filterQuery`, `selectedPriority`, and `searchQuery` into `signal<string>('')`, updated template bindings to `[ngModel]="sig()" (ngModelChange)="sig.set($event)"`, and updated computed filters to read signal values.

### 2. Off-by-One Forward Reorder Shift in Kanban Under Active Filters
- **Problem:** When re-ordering within the same column under an active filter, `moveItemInArray(currentList, actualFrom, actualTo)` with `actualTo = targetIdx` placed items moving forward after the intended target.
- **Failure Mode:** When moving an item forward, removing it from `currentList` shifts downstream elements down by 1. Calling `moveItemInArray` with the pre-removal target index caused the dragged item to overshoot by one position (e.g. dropping B between D and F placed B after F).
- **Fix:** In `onDrop`, removed `order` from `currentList` via `splice(fromIdx, 1)` first, resolved the exact target insertion index in the post-removal array using `resolveTargetIndex`, and spliced `order` into `actualTo`. Clamped fallback indices to `targetContainerData.length`.

### 3. Thermal Print Badge Container Layout Displacement
- **Problem:** In `asset-qr-modal.component.ts`, the modal card wrapper had CSS class `relative` without `print:static`, and page chrome (`app-sidebar`, `app-header`, `app-toast`) had layout height during printing.
- **Failure Mode:** In print mode, `#printable-badge-area` (positioned `position: absolute; top: 0;`) was positioned relative to the modal wrapper located at the bottom of the assets directory table (below page header, search bar, and equipment rows). As a result, the QR tag rendered hundreds of pixels down or on page 2, leaving page 1 blank.
- **Fix:** Added `print:static print:w-full print:max-w-none` to the modal card container in `asset-qr-modal.component.ts`, and added `app-sidebar, app-header, app-toast { display: none !important; }` in `styles.css`.

### 4. Missing Integer & Positive Bounds Validations on Forms
- **Problem:** `part-create-modal.component.ts` allowed non-integer stock and negative unit costs; `schedule-create-modal.component.ts` allowed non-integer frequency intervals; `asset-create-modal.component.ts` allowed warranty expiration dates earlier than purchase dates.
- **Failure Mode:** Submitting decimal or invalid values triggered unhandled 400 Bad Request responses from the NestJS backend (`stock_quantity must be an integer number`, `min_threshold must be a positive number`).
- **Fix:** Added client-side integer and range validations with immediate user-facing toast feedback across all modals.

### 5. Verification Suite Fix & Expansion
- **Fix:** Resolved `ReferenceError: targetContainerData is not defined` typo in `simulateResolveTargetIndex` fallback in `verify-frontend.js`.
- **Expansion:** Expanded `verify-frontend.js` from 66 to 81 tests, adding:
  - Print layout containment and chrome hiding assertions.
  - Angular Signal type declarations for all filter inputs.
  - Forward and backward same-column reorder simulations under active filters.
  - Form integer validations.
  - Live backend failure rejection tests (invalid status PATCH, non-integer stock POST, negative frequency POST).

## Verification Results
- `npm run build`: Zero errors, exit code 0.
- `node verify-frontend.js`: 81 passed, 0 failed.
