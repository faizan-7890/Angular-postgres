import { Component, inject, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScannerService } from '../../services/scanner.service';
import { Asset } from '../../models/opstrack.models';

@Component({
  selector: 'app-scanned-asset-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (scannerService.showQuickActions() && scannerService.scannedAsset(); as asset) {
      <div
        (click)="close()"
        class="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <div
          (click)="$event.stopPropagation()"
          class="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 flex flex-col"
        >
          <!-- Header -->
          <div class="flex items-start justify-between pb-4 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <span class="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tag Verified &bull; {{ asset.category }}
                </span>
                <h3 class="text-lg font-bold text-white mt-1">{{ asset.name }}</h3>
                <p class="text-xs text-slate-400 font-mono">SN: {{ asset.serial_number }} &bull; {{ asset.location }}</p>
              </div>
            </div>

            <button
              (click)="close()"
              class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Machine Status Strip -->
          <div class="my-5 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
            <div>
              <p class="text-[11px] text-slate-400 uppercase font-semibold">Equipment Health</p>
              <div class="flex items-center gap-2 mt-1">
                <span
                  class="w-2.5 h-2.5 rounded-full"
                  [ngClass]="{
                    'bg-emerald-500 animate-pulse': asset.status === 'OPERATIONAL',
                    'bg-amber-500 animate-pulse': asset.status === 'UNDER_MAINTENANCE',
                    'bg-slate-500': asset.status === 'DECOMMISSIONED' || asset.status === 'IN_STORAGE'
                  }"
                ></span>
                <span class="text-sm font-bold text-white uppercase">{{ asset.status }}</span>
              </div>
            </div>

            <div class="text-right">
              <p class="text-[11px] text-slate-400 uppercase font-semibold">Active Orders</p>
              <p class="text-sm font-bold text-blue-400 mt-1">
                {{ asset.maintenance_schedules?.length || 0 }} Schedules &bull; {{ asset._count?.work_orders ?? 0 }} Orders
              </p>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="space-y-2.5">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Field Actions</p>

            <!-- 1. Report Breakdown / Create Work Order -->
            <button
              (click)="triggerCreateWorkOrder(asset)"
              class="w-full flex items-center justify-between p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-left transition-all group"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-white group-hover:text-red-300">Report Breakdown / Create Work Order</h4>
                  <p class="text-xs text-slate-400">Pre-fill equipment tag for immediate emergency dispatch</p>
                </div>
              </div>
              <span class="text-xs font-bold text-red-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>

            <!-- 2. Inspect Full Maintenance History -->
            <button
              (click)="triggerViewDetails(asset)"
              class="w-full flex items-center justify-between p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-left transition-all group"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-white group-hover:text-blue-300">Inspect Maintenance History & Specs</h4>
                  <p class="text-xs text-slate-400">View repair logs, preventative tasks, and electrical specs</p>
                </div>
              </div>
              <span class="text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>

            <!-- 3. Print QR Tag -->
            <button
              (click)="triggerPrintBadge(asset)"
              class="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-left transition-all group"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-slate-700/50 text-slate-300 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-white group-hover:text-slate-200">Print Physical QR Badge</h4>
                  <p class="text-xs text-slate-400">Output standard 2" x 1" thermal label layout</p>
                </div>
              </div>
              <span class="text-xs font-bold text-slate-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-5 border-t border-slate-800 mt-5">
            <button
              (click)="scanAnother()"
              class="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Scan Another Tag
            </button>

            <button
              type="button"
              (click)="close()"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ScannedAssetModalComponent {
  scannerService = inject(ScannerService);

  openWorkOrder = output<Asset>();
  openDetails = output<Asset>();
  openPrintBadge = output<Asset>();

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }

  close() {
    this.scannerService.closeQuickActions();
  }

  scanAnother() {
    this.scannerService.closeQuickActions();
    this.scannerService.openScanner();
  }

  triggerCreateWorkOrder(asset: Asset) {
    this.close();
    this.openWorkOrder.emit(asset);
  }

  triggerViewDetails(asset: Asset) {
    this.close();
    this.openDetails.emit(asset);
  }

  triggerPrintBadge(asset: Asset) {
    this.close();
    this.openPrintBadge.emit(asset);
  }
}
