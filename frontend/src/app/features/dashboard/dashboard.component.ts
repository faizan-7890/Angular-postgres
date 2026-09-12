import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Asset, WorkOrder, MaintenanceSchedule, SparePart } from '../../core/models/opstrack.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8 animate-fadeIn">
      <!-- Welcome & Action Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Operational Overview
            <span class="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">Real-time</span>
          </h1>
          <p class="text-sm text-slate-400 mt-1">Live equipment health, reactive work orders, and preventative maintenance pipeline.</p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <button
            (click)="triggerMaintenanceCheck()"
            [disabled]="triggeringCheck()"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-slate-600 transition-all disabled:opacity-50 shadow-sm"
          >
            <svg class="w-4 h-4 text-indigo-400" [class.animate-spin]="triggeringCheck()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {{ triggeringCheck() ? 'Evaluating PM Tasks...' : 'Trigger Due Check' }}
          </button>

          <a
            routerLink="/kanban"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
            </svg>
            Kanban Board
          </a>
        </div>
      </div>

      <!-- Top Status Summary Cards (R1) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <!-- Total Assets -->
        <a
          routerLink="/assets"
          class="relative overflow-hidden p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 group shadow-lg shadow-slate-950/50"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Assets</span>
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-white tracking-tight">{{ totalAssets() }}</span>
            <span class="text-xs font-medium text-emerald-400 flex items-center">
              Active Fleet
            </span>
          </div>
          <div class="mt-2 text-xs text-slate-500 flex items-center gap-1 group-hover:text-blue-400 transition-colors">
            <span>View directory</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </a>

        <!-- Active Work Orders -->
        <a
          routerLink="/kanban"
          class="relative overflow-hidden p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 group shadow-lg shadow-slate-950/50"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Work Orders</span>
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-white tracking-tight">{{ activeWorkOrders() }}</span>
            <span class="text-xs font-medium text-indigo-400">Pending & In Progress</span>
          </div>
          <div class="mt-2 text-xs text-slate-500 flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
            <span>Manage on Kanban</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </a>

        <!-- Overdue Tasks -->
        <a
          routerLink="/schedules"
          class="relative overflow-hidden p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all duration-300 group shadow-lg shadow-slate-950/50"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Overdue Tasks</span>
            <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold tracking-tight" [class.text-rose-400]="overdueTasks() > 0" [class.text-white]="overdueTasks() === 0">
              {{ overdueTasks() }}
            </span>
            <span class="text-xs font-medium" [class.text-rose-400]="overdueTasks() > 0" [class.text-slate-400]="overdueTasks() === 0">
              {{ overdueTasks() > 0 ? 'Requires Action' : 'All Clear' }}
            </span>
          </div>
          <div class="mt-2 text-xs text-slate-500 flex items-center gap-1 group-hover:text-rose-400 transition-colors">
            <span>View PM Schedules</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </a>

        <!-- Low Stock Alerts -->
        <a
          routerLink="/inventory"
          class="relative overflow-hidden p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 group shadow-lg shadow-slate-950/50"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Low Stock Alerts</span>
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold tracking-tight" [class.text-amber-400]="lowStockAlerts() > 0" [class.text-white]="lowStockAlerts() === 0">
              {{ lowStockAlerts() }}
            </span>
            <span class="text-xs font-medium" [class.text-amber-400]="lowStockAlerts() > 0" [class.text-slate-400]="lowStockAlerts() === 0">
              {{ lowStockAlerts() > 0 ? 'Below Threshold' : 'Optimal Inventory' }}
            </span>
          </div>
          <div class="mt-2 text-xs text-slate-500 flex items-center gap-1 group-hover:text-amber-400 transition-colors">
            <span>Inspect inventory</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </a>
      </div>

      <!-- Main Content Split: Recent Work Orders & Preventative Pipeline -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Work Orders (2 Columns) -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <span>Active Work Orders</span>
              <span class="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">{{ activeOrdersList().length }}</span>
            </h2>
            <a routerLink="/kanban" class="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Open Board
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          <div class="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
            @if (loading()) {
              <div class="p-12 text-center text-slate-400">
                <div class="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p class="text-sm">Loading operational orders...</p>
              </div>
            } @else if (activeOrdersList().length === 0) {
              <div class="p-12 text-center">
                <div class="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <p class="text-slate-300 font-medium text-sm">No Active Work Orders</p>
                <p class="text-slate-500 text-xs mt-1">All equipment maintenance tickets are currently completed.</p>
              </div>
            } @else {
              <div class="divide-y divide-slate-800/80">
                @for (wo of activeOrdersList(); track wo.id) {
                  <div class="p-4 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-4">
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span
                          class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                          [ngClass]="{
                            'bg-rose-500/20 text-rose-300 border border-rose-500/30': wo.priority === 'CRITICAL',
                            'bg-amber-500/20 text-amber-300 border border-amber-500/30': wo.priority === 'HIGH',
                            'bg-blue-500/20 text-blue-300 border border-blue-500/30': wo.priority === 'MEDIUM',
                            'bg-slate-700/40 text-slate-300 border border-slate-600/30': wo.priority === 'LOW'
                          }"
                        >
                          {{ wo.priority }}
                        </span>
                        <span
                          class="px-2 py-0.5 rounded text-[10px] font-medium"
                          [ngClass]="{
                            'bg-indigo-500/15 text-indigo-400': wo.status === 'IN_PROGRESS',
                            'bg-amber-500/15 text-amber-400': wo.status === 'PENDING'
                          }"
                        >
                          {{ wo.status === 'IN_PROGRESS' ? 'IN PROGRESS' : 'PENDING' }}
                        </span>
                      </div>
                      <h3 class="text-sm font-semibold text-white truncate">{{ wo.title }}</h3>
                      <p class="text-xs text-slate-400 truncate mt-0.5">
                        <span class="text-slate-300 font-medium">{{ wo.assets?.name || 'Asset' }}</span> &bull; {{ wo.assets?.location || 'Unknown Location' }}
                      </p>
                    </div>

                    <div class="text-right flex-shrink-0">
                      <p class="text-xs font-medium text-slate-300">{{ wo.technicians?.full_name || 'Unassigned' }}</p>
                      <p class="text-[11px] text-slate-500 font-mono mt-0.5">{{ wo.scheduled_date ? (wo.scheduled_date | date:'MMM d, y') : 'Scheduled' }}</p>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Upcoming & Overdue Preventative Schedules (1 Column) -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <span>PM Schedules</span>
              <span class="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">{{ schedules().length }}</span>
            </h2>
            <a routerLink="/schedules" class="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          <div class="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3 shadow-lg">
            @if (loading()) {
              <div class="p-8 text-center text-slate-400 text-xs">Loading schedules...</div>
            } @else if (schedules().length === 0) {
              <div class="p-8 text-center text-slate-400 text-xs">No preventative schedules registered.</div>
            } @else {
              @for (schedule of schedules().slice(0, 5); track schedule.id) {
                <div class="p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <p class="text-xs font-bold text-white leading-snug">{{ schedule.task_name }}</p>
                      <p class="text-[11px] text-slate-400 truncate mt-0.5">{{ schedule.assets?.name }}</p>
                    </div>
                    <span
                      class="text-[10px] font-bold px-2 py-0.5 rounded uppercase flex-shrink-0"
                      [ngClass]="isScheduleOverdue(schedule.next_due_date) ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'"
                    >
                      {{ isScheduleOverdue(schedule.next_due_date) ? 'OVERDUE' : (schedule.frequency_interval_days + 'd cycle') }}
                    </span>
                  </div>
                  <div class="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>Due Date:</span>
                    <span class="font-mono" [class.text-rose-400]="isScheduleOverdue(schedule.next_due_date)" [class.text-slate-300]="!isScheduleOverdue(schedule.next_due_date)">
                      {{ schedule.next_due_date | date:'mediumDate' }}
                    </span>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  loading = signal<boolean>(true);
  triggeringCheck = signal<boolean>(false);

  assets = signal<Asset[]>([]);
  workOrders = signal<WorkOrder[]>([]);
  schedules = signal<MaintenanceSchedule[]>([]);
  parts = signal<SparePart[]>([]);

  totalAssets = computed(() => this.assets().length);
  activeOrdersList = computed(() =>
    this.workOrders().filter((wo) => wo.status === 'PENDING' || wo.status === 'IN_PROGRESS')
  );
  activeWorkOrders = computed(() => this.activeOrdersList().length);

  overdueTasks = computed(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return this.schedules().filter((s) => new Date(s.next_due_date) <= today).length;
  });

  lowStockAlerts = computed(() =>
    this.parts().filter((p) => Number(p.stock_quantity) <= Number(p.min_threshold)).length
  );

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    forkJoin({
      assets: this.api.getAssets(),
      workOrders: this.api.getWorkOrders(),
      schedules: this.api.getSchedules(),
      parts: this.api.getSpareParts(),
    }).subscribe({
      next: (res) => {
        this.assets.set(res.assets);
        this.workOrders.set(res.workOrders);
        this.schedules.set(res.schedules);
        this.parts.set(res.parts);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.toast.showError('Unable to connect to OpsTrack API backend at localhost:3000');
        this.loading.set(false);
      },
    });
  }

  isScheduleOverdue(dueDate: string): boolean {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return new Date(dueDate) <= today;
  }

  triggerMaintenanceCheck() {
    this.triggeringCheck.set(true);
    this.api.triggerDueCheck().subscribe({
      next: (res) => {
        this.triggeringCheck.set(false);
        this.toast.showSuccess(
          `Preventative check complete: ${res.generatedCount} work order(s) generated.`,
          'Worker Triggered'
        );
        this.loadData();
      },
      error: (err) => {
        this.triggeringCheck.set(false);
        this.toast.showError('Failed to trigger maintenance due check');
      },
    });
  }
}
