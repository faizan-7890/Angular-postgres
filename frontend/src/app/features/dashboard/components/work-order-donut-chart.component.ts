import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkOrder } from '../../../core/models/opstrack.models';

export interface SliceData {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  percentage: number;
  offset: number;
  dashLength: number;
}

@Component({
  selector: 'app-work-order-donut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
      <!-- Header with Toggle -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Work Orders Distribution</span>
            <span class="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              {{ totalOrders() }} Total
            </span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Breakdown across lifecycle stages and urgency tiers
          </p>
        </div>

        <!-- Mode Toggle -->
        <div class="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold">
          <button
            (click)="viewMode.set('status')"
            [ngClass]="viewMode() === 'status' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'"
            class="px-3 py-1 rounded-lg transition-all"
          >
            By Status
          </button>
          <button
            (click)="viewMode.set('priority')"
            [ngClass]="viewMode() === 'priority' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'"
            class="px-3 py-1 rounded-lg transition-all"
          >
            By Priority
          </button>
        </div>
      </div>

      <!-- Chart & Legend -->
      @if (totalOrders() === 0) {
        <div class="py-12 text-center text-slate-400 text-xs">
          No work orders available to visualize.
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <!-- SVG Donut -->
          <div class="md:col-span-6 flex justify-center relative">
            <div class="relative w-48 h-48 sm:w-56 sm:h-56">
              <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                <!-- Background track -->
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  class="stroke-slate-100 dark:stroke-slate-800"
                  stroke-width="18"
                  fill="none"
                />

                <!-- Dynamic Slices -->
                @for (slice of slices(); track slice.label) {
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    [attr.stroke]="slice.color"
                    stroke-width="18"
                    fill="none"
                    [attr.stroke-dasharray]="slice.dashLength + ' ' + circumference"
                    [attr.stroke-dashoffset]="-slice.offset"
                    stroke-linecap="round"
                    class="transition-all duration-500 cursor-pointer hover:opacity-80"
                    (mouseenter)="activeLabel.set(slice.label)"
                    (mouseleave)="activeLabel.set(null)"
                  />
                }
              </svg>

              <!-- Center Metric Text -->
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                @if (highlightedSlice(); as active) {
                  <span class="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">{{ active.label }}</span>
                  <span class="text-2xl font-black text-slate-900 dark:text-white">{{ active.value }}</span>
                  <span class="text-[11px] font-semibold text-blue-600 dark:text-blue-400">{{ active.percentage }}%</span>
                } @else {
                  <span class="text-xs uppercase font-medium text-slate-400">Total</span>
                  <span class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{{ totalOrders() }}</span>
                  <span class="text-[10px] text-slate-500 uppercase tracking-wider">Tickets</span>
                }
              </div>
            </div>
          </div>

          <!-- Legend Table -->
          <div class="md:col-span-6 space-y-2.5">
            @for (slice of slices(); track slice.label) {
              <div
                (mouseenter)="activeLabel.set(slice.label)"
                (mouseleave)="activeLabel.set(null)"
                [ngClass]="activeLabel() === slice.label ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60' : 'border-transparent'"
                class="p-2.5 rounded-xl border hover:border-slate-200 dark:hover:border-slate-700/60 transition-all flex items-center justify-between cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <span class="w-3 h-3 rounded-full flex-shrink-0" [style.backgroundColor]="slice.color"></span>
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ slice.label }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono font-bold text-slate-900 dark:text-white">{{ slice.value }}</span>
                  <span class="text-[11px] font-mono text-slate-400 w-10 text-right">{{ slice.percentage }}%</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class WorkOrderDonutChartComponent {
  orders = input<WorkOrder[]>([]);

  viewMode = signal<'status' | 'priority'>('status');
  activeLabel = signal<string | null>(null);

  readonly radius = 60;
  readonly circumference = 2 * Math.PI * 60; // ~376.99

  totalOrders = computed(() => this.orders().length);

  slices = computed<SliceData[]>(() => {
    const list = this.orders();
    const total = list.length;
    if (total === 0) return [];

    let raw: { label: string; count: number; color: string; bgColor: string }[] = [];

    if (this.viewMode() === 'status') {
      const pending = list.filter((o) => o.status === 'PENDING').length;
      const inProgress = list.filter((o) => o.status === 'IN_PROGRESS').length;
      const completed = list.filter((o) => o.status === 'COMPLETED').length;
      const cancelled = list.filter((o) => o.status === 'CANCELLED').length;

      raw = [
        { label: 'Pending', count: pending, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.2)' },
        { label: 'In Progress', count: inProgress, color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.2)' },
        { label: 'Completed', count: completed, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.2)' },
        { label: 'Cancelled', count: cancelled, color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.2)' },
      ].filter((item) => item.count > 0);
    } else {
      const critical = list.filter((o) => o.priority === 'CRITICAL').length;
      const high = list.filter((o) => o.priority === 'HIGH').length;
      const medium = list.filter((o) => o.priority === 'MEDIUM').length;
      const low = list.filter((o) => o.priority === 'LOW').length;

      raw = [
        { label: 'Critical', count: critical, color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.2)' },
        { label: 'High', count: high, color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.2)' },
        { label: 'Medium', count: medium, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.2)' },
        { label: 'Low', count: low, color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.2)' },
      ].filter((item) => item.count > 0);
    }

    let runningOffset = 0;
    return raw.map((item) => {
      const percentage = Math.round((item.count / total) * 100);
      const dashLength = (item.count / total) * this.circumference;
      const currentSlice: SliceData = {
        label: item.label,
        value: item.count,
        color: item.color,
        bgColor: item.bgColor,
        percentage,
        offset: runningOffset,
        dashLength,
      };
      runningOffset += dashLength;
      return currentSlice;
    });
  });

  highlightedSlice = computed(() => {
    const label = this.activeLabel();
    if (!label) return null;
    return this.slices().find((s) => s.label === label) || null;
  });
}
