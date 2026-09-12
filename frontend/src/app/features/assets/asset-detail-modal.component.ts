import { Component, input, output, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Asset } from '../../core/models/opstrack.models';

@Component({
  selector: 'app-asset-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      (click)="close.emit()"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        (click)="$event.stopPropagation()"
        class="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 max-h-[90vh] flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-start justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mt-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-lg font-bold text-white">{{ asset()?.name || 'Asset Details' }}</h2>
                @if (asset()) {
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                    [ngClass]="{
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': asset()?.status === 'OPERATIONAL',
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30': asset()?.status === 'UNDER_MAINTENANCE',
                      'bg-slate-700/50 text-slate-400 border border-slate-600': asset()?.status === 'DECOMMISSIONED' || asset()?.status === 'IN_STORAGE'
                    }"
                  >
                    {{ asset()?.status }}
                  </span>
                }
              </div>
              <p class="text-xs text-slate-400 font-mono mt-0.5">SN: {{ asset()?.serial_number }} &bull; {{ asset()?.category }}</p>
            </div>
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

        <!-- Body / Content -->
        <div class="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          @if (loading()) {
            <div class="p-12 text-center text-slate-400">
              <div class="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p class="text-sm">Loading asset metadata & maintenance history...</p>
            </div>
          } @else {
            @if (asset(); as item) {
              <!-- Meta Overview Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span class="text-[11px] text-slate-400 uppercase font-semibold">Location</span>
                  <p class="text-sm font-semibold text-slate-100 mt-1">{{ item.location }}</p>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span class="text-[11px] text-slate-400 uppercase font-semibold">Commission Date</span>
                  <p class="text-sm font-semibold text-slate-100 mt-1">
                    {{ item.purchase_date ? (item.purchase_date | date:'mediumDate') : 'Not specified' }}
                  </p>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span class="text-[11px] text-slate-400 uppercase font-semibold">Warranty Expiration</span>
                  <p class="text-sm font-semibold text-slate-100 mt-1">
                    {{ item.warranty_expires_at ? (item.warranty_expires_at | date:'mediumDate') : 'No warranty' }}
                  </p>
                </div>
              </div>

              <!-- Technical Specifications (JSON specs) -->
              <div>
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Technical Specifications</h3>
                <div class="p-4 rounded-xl bg-slate-800/30 border border-slate-800">
                  @if (getSpecsKeys(item.specs).length === 0) {
                    <p class="text-xs text-slate-500 italic">No technical specs recorded for this equipment.</p>
                  } @else {
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      @for (key of getSpecsKeys(item.specs); track key) {
                        <div>
                          <span class="text-[10px] uppercase font-mono text-slate-500">{{ formatKey(key) }}</span>
                          <p class="text-xs font-semibold text-slate-200 font-mono">{{ formatSpecValue(item.specs[key]) }}</p>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Preventative Maintenance Schedules -->
              <div>
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Preventative Maintenance Schedules</span>
                  <span class="text-[11px] font-mono text-blue-400">{{ item.maintenance_schedules?.length || 0 }} Rules</span>
                </h3>
                <div class="rounded-xl border border-slate-800 overflow-hidden">
                  @if (!item.maintenance_schedules || item.maintenance_schedules.length === 0) {
                    <div class="p-4 text-center text-xs text-slate-500 bg-slate-800/20">
                      No preventative maintenance schedules assigned.
                    </div>
                  } @else {
                    <div class="divide-y divide-slate-800 bg-slate-800/20">
                      @for (sch of item.maintenance_schedules; track sch.id) {
                        <div class="p-3 flex items-center justify-between gap-4 text-xs">
                          <div>
                            <p class="font-semibold text-white">{{ sch.task_name }}</p>
                            <p class="text-[11px] text-slate-400 mt-0.5">Recurring every {{ sch.frequency_interval_days }} days</p>
                          </div>
                          <div class="text-right">
                            <p class="text-slate-300 font-mono">Next: {{ sch.next_due_date | date:'mediumDate' }}</p>
                            @if (sch.last_completed_at) {
                              <p class="text-[10px] text-emerald-400 mt-0.5">Last: {{ sch.last_completed_at | date:'shortDate' }}</p>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Maintenance & Repair Work Order History -->
              <div>
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Maintenance Work Order History</span>
                  <span class="text-[11px] font-mono text-blue-400">{{ item.work_orders?.length || 0 }} Total</span>
                </h3>
                <div class="rounded-xl border border-slate-800 overflow-hidden">
                  @if (!item.work_orders || item.work_orders.length === 0) {
                    <div class="p-4 text-center text-xs text-slate-500 bg-slate-800/20">
                      No work orders recorded for this asset.
                    </div>
                  } @else {
                    <div class="divide-y divide-slate-800 bg-slate-800/20 max-h-60 overflow-y-auto">
                      @for (wo of item.work_orders; track wo.id) {
                        <div class="p-3 text-xs space-y-1.5">
                          <div class="flex items-center justify-between">
                            <span class="font-semibold text-white">{{ wo.title }}</span>
                            <span
                              class="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                              [ngClass]="{
                                'bg-emerald-500/20 text-emerald-300': wo.status === 'COMPLETED',
                                'bg-indigo-500/20 text-indigo-300': wo.status === 'IN_PROGRESS',
                                'bg-amber-500/20 text-amber-300': wo.status === 'PENDING'
                              }"
                            >
                              {{ wo.status }}
                            </span>
                          </div>
                          <p class="text-slate-400 text-[11px]">{{ wo.description || 'No description entered.' }}</p>
                          <div class="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                            <span>Tech: {{ wo.technicians?.full_name || 'Unassigned' }}</span>
                            <span>{{ wo.created_at | date:'mediumDate' }}</span>
                          </div>
                          <!-- Consumed parts in this work order -->
                          @if (wo.work_order_parts && wo.work_order_parts.length > 0) {
                            <div class="mt-1 flex items-center gap-1.5 flex-wrap">
                              <span class="text-[10px] text-slate-400">Parts Used:</span>
                              @for (part of wo.work_order_parts; track part.part_id) {
                                <span class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                                  {{ part.spare_parts?.name }} &times; {{ part.quantity_used }}
                                </span>
                              }
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          }
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-800 flex-shrink-0">
          @if (asset(); as item) {
            <button
              type="button"
              (click)="printQr.emit(item)"
              class="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
              </svg>
              Print QR Tag
            </button>
          } @else {
            <div></div>
          }

          <button
            type="button"
            (click)="close.emit()"
            class="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  `
})
export class AssetDetailModalComponent implements OnInit {
  assetId = input.required<string>();
  close = output<void>();
  printQr = output<Asset>();

  private api = inject(ApiService);
  private toast = inject(ToastService);

  loading = signal<boolean>(true);
  asset = signal<Asset | null>(null);

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close.emit();
  }

  ngOnInit() {
    this.loadAsset();
  }

  loadAsset() {
    this.loading.set(true);
    this.api.getAssetById(this.assetId()).subscribe({
      next: (data) => {
        this.asset.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.showError('Failed to load asset details');
        this.loading.set(false);
      },
    });
  }

  getSpecsKeys(specs: Record<string, any> | null | undefined): string[] {
    if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return [];
    return Object.keys(specs);
  }

  formatSpecValue(val: any): string {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }

  formatKey(key: string): string {
    return key.replace(/_/g, ' ');
  }
}
