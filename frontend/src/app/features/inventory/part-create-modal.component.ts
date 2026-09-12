import { Component, output, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { CreatePartDto } from '../../core/models/opstrack.models';

@Component({
  selector: 'app-part-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      (click)="close.emit()"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        (click)="$event.stopPropagation()"
        class="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100"
      >
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <h2 class="text-base font-bold text-white">Add Spare Part to Catalog</h2>
          </div>
          <button
            (click)="close.emit()"
            class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="submit()" class="py-4 space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Part Name *</label>
            <input
              type="text"
              [(ngModel)]="name"
              name="name"
              required
              placeholder="e.g. Synthetic Hydraulic Filter Cartridge"
              class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">SKU / Item Code *</label>
            <input
              type="text"
              [(ngModel)]="sku"
              name="sku"
              required
              placeholder="e.g. PART-FLT-HYD-04"
              class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono uppercase"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Initial Stock *</label>
              <input
                type="number"
                min="0"
                [(ngModel)]="stockQuantity"
                name="stockQuantity"
                required
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Min Threshold</label>
              <input
                type="number"
                min="1"
                [(ngModel)]="minThreshold"
                name="minThreshold"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Unit Cost ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                [(ngModel)]="unitCost"
                name="unitCost"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              (click)="close.emit()"
              class="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="submitting() || !name || !sku || stockQuantity === null"
              class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
            >
              {{ submitting() ? 'Adding...' : 'Add Part' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PartCreateModalComponent {
  close = output<void>();
  created = output<void>();

  private api = inject(ApiService);
  private toast = inject(ToastService);

  name = '';
  sku = '';
  stockQuantity: number = 10;
  minThreshold: number = 5;
  unitCost: number = 25.0;

  submitting = signal<boolean>(false);

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close.emit();
  }

  submit() {
    if (!this.name || !this.sku || this.stockQuantity === null || this.stockQuantity === undefined) {
      this.toast.showError('Name, SKU, and Stock Quantity are required');
      return;
    }

    if (
      !Number.isInteger(Number(this.stockQuantity)) ||
      Number(this.stockQuantity) < 0
    ) {
      this.toast.showError('Initial stock must be a non-negative whole integer.');
      return;
    }

    if (
      this.minThreshold !== null &&
      this.minThreshold !== undefined &&
      (!Number.isInteger(Number(this.minThreshold)) || Number(this.minThreshold) < 1)
    ) {
      this.toast.showError('Min threshold must be a positive whole integer (>= 1).');
      return;
    }

    if (this.unitCost !== null && this.unitCost !== undefined && Number(this.unitCost) < 0) {
      this.toast.showError('Unit cost cannot be negative.');
      return;
    }

    this.submitting.set(true);

    const dto: CreatePartDto = {
      name: this.name,
      sku: this.sku.toUpperCase(),
      stock_quantity: Number(this.stockQuantity),
      min_threshold: Number(this.minThreshold),
      unit_cost: Number(this.unitCost),
    };

    this.api.createSparePart(dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.showSuccess(`Spare part "${this.name}" registered successfully`);
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = Array.isArray(err.error?.message)
          ? err.error.message.join(', ')
          : (err.error?.message || 'Failed to add spare part');
        this.toast.showError(msg);
      },
    });
  }
}
