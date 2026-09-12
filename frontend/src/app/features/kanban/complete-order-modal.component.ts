import { Component, input, output, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { WorkOrder, SparePart, CompleteWorkOrderDto } from '../../core/models/opstrack.models';

interface PartRow {
  part_id: string;
  quantity_used: number;
}

@Component({
  selector: 'app-complete-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      (click)="handleCancel()"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        (click)="$event.stopPropagation()"
        class="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100"
      >
        <!-- Header -->
        <div class="flex items-start justify-between pb-4 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-base font-bold text-white">Complete Work Order</h2>
              <p class="text-xs text-slate-400">Deduct consumed inventory and advance maintenance cycles</p>
            </div>
          </div>
          <button
            (click)="handleCancel()"
            class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Work Order Brief Summary -->
        <div class="py-3 px-4 my-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <span class="font-bold text-white text-sm truncate">{{ workOrder().title }}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
              {{ workOrder().priority }}
            </span>
          </div>
          <p class="text-slate-400">
            Asset: <span class="text-slate-200">{{ workOrder().assets?.name }}</span> &bull;
            Tech: <span class="text-slate-200">{{ workOrder().technicians?.full_name || 'Unassigned' }}</span>
          </p>
        </div>

        <!-- Error Banner (e.g. Insufficient Stock) -->
        @if (errorMessage()) {
          <div class="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <svg class="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p class="font-semibold">Stock Deduction Error</p>
              <p class="mt-0.5 text-rose-200">{{ errorMessage() }}</p>
            </div>
          </div>
        }

        <!-- Consumed Spare Parts Section -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Consumed Spare Parts (Optional)
            </label>
            <button
              type="button"
              (click)="addPartRow()"
              class="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Part
            </button>
          </div>

          @if (partsRows().length === 0) {
            <div class="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
              No parts consumed for this maintenance repair.
            </div>
          } @else {
            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              @for (row of partsRows(); track $index; let idx = $index) {
                <div class="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/80">
                  <!-- Part Select -->
                  <div class="flex-1">
                    <select
                      [(ngModel)]="row.part_id"
                      class="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="" disabled>Select a spare part...</option>
                      @for (p of availableParts(); track p.id) {
                        <option [value]="p.id">
                          {{ p.name }} (Available: {{ p.stock_quantity }}, SKU: {{ p.sku }})
                        </option>
                      }
                    </select>
                  </div>

                  <!-- Quantity Input -->
                  <div class="w-24">
                    <input
                      type="number"
                      min="1"
                      [(ngModel)]="row.quantity_used"
                      placeholder="Qty"
                      class="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white text-center focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <!-- Remove Button -->
                  <button
                    type="button"
                    (click)="removePartRow(idx)"
                    class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Remove part row"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
                @if (isExceedingStock(row)) {
                  <p class="text-[10px] text-amber-400 pl-2">
                    Warning: Total requested ({{ getTotalQuantityForPart(row.part_id) }}) exceeds current in-stock balance ({{ getPart(row.part_id)?.stock_quantity || 0 }}).
                  </p>
                }
              }
            </div>
          }
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-slate-800">
          <button
            type="button"
            (click)="handleCancel()"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            (click)="submitCompletion()"
            [disabled]="submitting()"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
          >
            @if (submitting()) {
              <div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Deducting & Completing...</span>
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Confirm Completion</span>
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class CompleteOrderModalComponent implements OnInit {
  workOrder = input.required<WorkOrder>();
  close = output<void>();
  completed = output<WorkOrder>();
  cancelRevert = output<void>();

  private api = inject(ApiService);
  private toast = inject(ToastService);

  availableParts = signal<SparePart[]>([]);
  partsRows = signal<PartRow[]>([]);
  submitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  @HostListener('document:keydown.escape')
  onEscapePress() {
    this.handleCancel();
  }

  ngOnInit() {
    this.loadParts();
  }

  loadParts() {
    this.api.getSpareParts().subscribe({
      next: (parts) => this.availableParts.set(parts),
      error: (err) => {
        console.error('Failed to load parts:', err);
        this.toast.showError('Unable to load spare parts catalog');
      },
    });
  }

  getPart(partId: string): SparePart | undefined {
    return this.availableParts().find((p) => p.id === partId);
  }

  getTotalQuantityForPart(partId: string): number {
    return this.partsRows()
      .filter((r) => r.part_id === partId)
      .reduce((sum, r) => sum + (Number(r.quantity_used) || 0), 0);
  }

  isExceedingStock(row: PartRow): boolean {
    if (!row.part_id) return false;
    const p = this.getPart(row.part_id);
    if (!p) return false;
    const total = this.getTotalQuantityForPart(row.part_id);
    return total > Number(p.stock_quantity);
  }

  addPartRow() {
    const firstPart = this.availableParts()[0];
    this.partsRows.update((rows) => [
      ...rows,
      { part_id: firstPart ? firstPart.id : '', quantity_used: 1 },
    ]);
  }

  removePartRow(index: number) {
    this.partsRows.update((rows) => rows.filter((_, i) => i !== index));
  }

  handleCancel() {
    this.cancelRevert.emit();
    this.close.emit();
  }

  submitCompletion() {
    this.errorMessage.set(null);

    // Validate rows
    const rows = this.partsRows();
    for (const r of rows) {
      if (!r.part_id) {
        this.errorMessage.set('Please select a spare part for each added item or remove the row.');
        return;
      }
      if (
        r.quantity_used === null ||
        r.quantity_used === undefined ||
        Number(r.quantity_used) <= 0 ||
        !Number.isInteger(Number(r.quantity_used))
      ) {
        this.errorMessage.set('Consumed quantity must be a positive whole integer.');
        return;
      }
    }

    // Check consolidated stock availability
    const consolidatedMap = new Map<string, number>();
    for (const r of rows) {
      const current = consolidatedMap.get(r.part_id) || 0;
      consolidatedMap.set(r.part_id, current + Number(r.quantity_used));
    }

    for (const [partId, totalUsed] of consolidatedMap.entries()) {
      const part = this.getPart(partId);
      if (part && totalUsed > Number(part.stock_quantity)) {
        this.errorMessage.set(
          `Insufficient stock for "${part.name}". Available: ${part.stock_quantity}, Total Requested: ${totalUsed}`
        );
        return;
      }
    }

    const dto: CompleteWorkOrderDto = {
      parts_used: Array.from(consolidatedMap.entries()).map(([part_id, quantity_used]) => ({
        part_id,
        quantity_used,
      })),
    };

    this.submitting.set(true);

    this.api.completeWorkOrder(this.workOrder().id, dto).subscribe({
      next: (updated) => {
        this.submitting.set(false);
        this.toast.showSuccess(
          `Work order "${this.workOrder().title}" completed successfully. Inventory updated.`,
          'Completed'
        );
        this.completed.emit(updated);
        this.close.emit();
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = Array.isArray(err.error?.message)
          ? err.error.message.join(', ')
          : (err.error?.message || 'Failed to complete work order');
        this.errorMessage.set(msg);
        this.toast.showError(msg, 'Completion Failed');
      },
    });
  }
}
