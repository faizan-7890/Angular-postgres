import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Asset, WorkOrder, MaintenanceSchedule, SparePart } from '../../../core/models/opstrack.models';

@Component({
  selector: 'app-kpi-health-strip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Equipment Uptime / Availability -->
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fleet Availability</p>
          <div class="mt-1 flex items-baseline gap-2">
            <span class="text-2xl font-black text-slate-900 dark:text-white">{{ uptimeRate() }}%</span>
            <span class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Target &gt;95%</span>
          </div>
          <div class="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full" [style.width.%]="uptimeRate()"></div>
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
      </div>

      <!-- 2. PM Schedule Compliance Rate -->
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">PM Compliance</p>
          <div class="mt-1 flex items-baseline gap-2">
            <span class="text-2xl font-black text-slate-900 dark:text-white">{{ pmComplianceRate() }}%</span>
            <span
              class="text-[11px] font-semibold"
              [class.text-rose-500]="pmComplianceRate() < 80"
              [class.text-emerald-500]="pmComplianceRate() >= 80"
            >
              {{ pmComplianceRate() >= 80 ? 'On Track' : 'Attention' }}
            </span>
          </div>
          <div class="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              [class.bg-emerald-500]="pmComplianceRate() >= 80"
              [class.bg-rose-500]="pmComplianceRate() < 80"
              [style.width.%]="pmComplianceRate()"
            ></div>
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
      </div>

      <!-- 3. Work Order Completion Ratio -->
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resolution Rate</p>
          <div class="mt-1 flex items-baseline gap-2">
            <span class="text-2xl font-black text-slate-900 dark:text-white">{{ resolutionRate() }}%</span>
            <span class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Completed</span>
          </div>
          <div class="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div class="h-full bg-indigo-500 rounded-full" [style.width.%]="resolutionRate()"></div>
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
      </div>

      <!-- 4. Inventory Health Index -->
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Inventory Health</p>
          <div class="mt-1 flex items-baseline gap-2">
            <span class="text-2xl font-black text-slate-900 dark:text-white">{{ inventoryHealthRate() }}%</span>
            <span
              class="text-[11px] font-semibold"
              [class.text-amber-500]="inventoryHealthRate() < 100"
              [class.text-emerald-500]="inventoryHealthRate() === 100"
            >
              {{ inventoryHealthRate() === 100 ? 'Fully Stocked' : 'Reorders Due' }}
            </span>
          </div>
          <div class="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              [class.bg-emerald-500]="inventoryHealthRate() >= 90"
              [class.bg-amber-500]="inventoryHealthRate() < 90"
              [style.width.%]="inventoryHealthRate()"
            ></div>
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
      </div>
    </div>
  `
})
export class KpiHealthStripComponent {
  assets = input<Asset[]>([]);
  workOrders = input<WorkOrder[]>([]);
  schedules = input<MaintenanceSchedule[]>([]);
  parts = input<SparePart[]>([]);

  uptimeRate = computed(() => {
    const list = this.assets();
    if (list.length === 0) return 100;
    const op = list.filter((a) => a.status === 'OPERATIONAL').length;
    return Math.round((op / list.length) * 100);
  });

  pmComplianceRate = computed(() => {
    const list = this.schedules();
    if (list.length === 0) return 100;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const onTime = list.filter((s) => new Date(s.next_due_date) > today).length;
    return Math.round((onTime / list.length) * 100);
  });

  resolutionRate = computed(() => {
    const list = this.workOrders();
    if (list.length === 0) return 0;
    const completed = list.filter((w) => w.status === 'COMPLETED').length;
    return Math.round((completed / list.length) * 100);
  });

  inventoryHealthRate = computed(() => {
    const list = this.parts();
    if (list.length === 0) return 100;
    const healthy = list.filter((p) => Number(p.stock_quantity) > Number(p.min_threshold)).length;
    return Math.round((healthy / list.length) * 100);
  });
}
