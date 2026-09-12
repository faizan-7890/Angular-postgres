import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { SparePart } from '../../core/models/opstrack.models';
import { PartCreateModalComponent } from './part-create-modal.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, PartCreateModalComponent],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Spare Parts & Materials Inventory
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-medium">
              {{ parts().length }} Items
            </span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time stock quantities, reorder thresholds, and atomic consumption ledger.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            (click)="showCreateModal.set(true)"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Spare Part
          </button>
        </div>
      </div>

      <!-- Filters & Toolbar -->
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Search -->
        <div class="relative flex-1 w-full">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Search parts by name or SKU..."
            class="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <!-- Filter Toggle & Low Stock Warning -->
        <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <label class="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-300">
            <input
              type="checkbox"
              [ngModel]="lowStockOnly()"
              (ngModelChange)="toggleLowStock($event)"
              class="w-4 h-4 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>Low Stock Alerts Only</span>
          </label>

          @if (lowStockCount() > 0) {
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              {{ lowStockCount() }} Low Stock
            </span>
          }
        </div>
      </div>

      <!-- Inventory Table (R5) -->
      <div class="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        @if (loading()) {
          <div class="p-16 text-center text-slate-400">
            <div class="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p class="text-sm">Querying spare parts stock levels...</p>
          </div>
        } @else if (filteredParts().length === 0) {
          <div class="p-16 text-center">
            <div class="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <p class="text-slate-300 font-semibold text-sm">No Spare Parts Found</p>
            <p class="text-slate-500 text-xs mt-1">
              {{ lowStockOnly() ? 'No items are currently below minimum thresholds.' : 'Add items to the inventory catalog.' }}
            </p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                  <th class="py-3.5 px-4 sm:px-6">Part Name / SKU</th>
                  <th class="py-3.5 px-4 text-center">Current Stock</th>
                  <th class="py-3.5 px-4 text-center">Min Threshold</th>
                  <th class="py-3.5 px-4 text-right">Unit Cost</th>
                  <th class="py-3.5 px-4 text-right">Inventory Value</th>
                  <th class="py-3.5 px-4 sm:px-6 text-right">Stock Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/80">
                @for (part of filteredParts(); track part.id) {
                  <tr
                    class="hover:bg-slate-800/40 transition-colors"
                    [ngClass]="{ 'bg-amber-500/10': isLowStock(part) }"
                  >
                    <td class="py-4 px-4 sm:px-6">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs border"
                          [ngClass]="isLowStock(part) ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'"
                        >
                          {{ part.name.charAt(0) }}
                        </div>
                        <div>
                          <p class="font-bold text-white text-sm leading-snug">{{ part.name }}</p>
                          <p class="font-mono text-[11px] text-slate-400 mt-0.5">{{ part.sku }}</p>
                        </div>
                      </div>
                    </td>

                    <td class="py-4 px-4 text-center">
                      <span
                        class="text-base font-extrabold font-mono"
                        [ngClass]="{
                          'text-rose-400': part.stock_quantity <= 0,
                          'text-amber-400': part.stock_quantity > 0 && part.stock_quantity <= part.min_threshold,
                          'text-slate-100': part.stock_quantity > part.min_threshold
                        }"
                      >
                        {{ part.stock_quantity }}
                      </span>
                    </td>

                    <td class="py-4 px-4 text-center font-mono text-slate-400">
                      {{ part.min_threshold }}
                    </td>

                    <td class="py-4 px-4 text-right font-mono text-slate-300">
                      &dollar;{{ part.unit_cost | number:'1.2-2' }}
                    </td>

                    <td class="py-4 px-4 text-right font-mono font-semibold text-slate-200">
                      &dollar;{{ calculateTotal(part) | number:'1.2-2' }}
                    </td>

                    <td class="py-4 px-4 sm:px-6 text-right">
                      <!-- Stock Badges Highlighting Low-Stock Items (R5) -->
                      @if (part.stock_quantity <= 0) {
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                          OUT OF STOCK
                        </span>
                      } @else if (part.stock_quantity <= part.min_threshold) {
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          LOW STOCK ALERT
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          HEALTHY STOCK
                        </span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Create Spare Part Modal -->
      @if (showCreateModal()) {
        <app-part-create-modal
          (close)="showCreateModal.set(false)"
          (created)="loadParts()"
        />
      }
    </div>
  `
})
export class InventoryComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  loading = signal<boolean>(true);
  parts = signal<SparePart[]>([]);
  lowStockOnly = signal<boolean>(false);
  showCreateModal = signal<boolean>(false);

  searchQuery = signal<string>('');

  lowStockCount = computed(() =>
    this.parts().filter((p) => Number(p.stock_quantity) <= Number(p.min_threshold)).length
  );

  filteredParts = computed(() => {
    let list = this.parts();
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }
    return list;
  });

  ngOnInit() {
    this.loadParts();
  }

  loadParts() {
    this.loading.set(true);
    this.api.getSpareParts({ lowStockOnly: this.lowStockOnly() }).subscribe({
      next: (data) => {
        this.parts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.showError('Failed to load spare parts inventory');
        this.loading.set(false);
      },
    });
  }

  toggleLowStock(checked: boolean) {
    this.lowStockOnly.set(checked);
    this.loadParts();
  }

  isLowStock(part: SparePart): boolean {
    return Number(part.stock_quantity) <= Number(part.min_threshold);
  }

  calculateTotal(part: SparePart): number {
    return Number(part.stock_quantity) * Number(part.unit_cost);
  }
}
