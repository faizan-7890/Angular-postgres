import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { MaintenanceSchedule } from '../../core/models/opstrack.models';
import { ScheduleCreateModalComponent } from './schedule-create-modal.component';

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleCreateModalComponent],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Preventative Maintenance Schedules
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-medium">
              {{ schedules().length }} Rules
            </span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">
            Automated recurring PM rules, calendar intervals, and automated work-order generation workers.
          </p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- Trigger Due Check Action Button (R5) -->
          <button
            (click)="triggerDueCheck()"
            [disabled]="triggering()"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 hover:border-slate-600 transition-all disabled:opacity-50 shadow-md"
          >
            <svg class="w-4 h-4 text-indigo-400" [class.animate-spin]="triggering()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {{ triggering() ? 'Running PM Evaluation...' : 'Trigger Due Check' }}
          </button>

          <!-- Create Schedule Button -->
          <button
            (click)="showCreateModal.set(true)"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New PM Rule
          </button>
        </div>
      </div>

      <!-- Filters & Metrics Banner -->
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <!-- Filter Toggle -->
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <label class="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-300">
            <input
              type="checkbox"
              [ngModel]="dueSoonOnly()"
              (ngModelChange)="toggleDueSoon($event)"
              class="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>Show Due Soon Only (&le; 7 days)</span>
          </label>
        </div>

        <!-- Quick Overdue Alert Pill -->
        <div class="flex items-center gap-4 text-xs">
          @if (overdueCount() > 0) {
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              {{ overdueCount() }} schedule(s) currently overdue
            </span>
          } @else {
            <span class="text-slate-400">All recurring rules up to date</span>
          }
        </div>
      </div>

      <!-- Schedules List Table -->
      <div class="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        @if (loading()) {
          <div class="p-16 text-center text-slate-400">
            <div class="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p class="text-sm">Fetching preventative maintenance schedules...</p>
          </div>
        } @else if (schedules().length === 0) {
          <div class="p-16 text-center">
            <div class="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <p class="text-slate-300 font-semibold text-sm">No Maintenance Schedules Found</p>
            <p class="text-slate-500 text-xs mt-1">Configure automated PM schedules to prevent equipment downtime.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                  <th class="py-3.5 px-4 sm:px-6">Task / Frequency</th>
                  <th class="py-3.5 px-4">Target Equipment</th>
                  <th class="py-3.5 px-4">Location</th>
                  <th class="py-3.5 px-4">Next Due Date</th>
                  <th class="py-3.5 px-4">Last Completed</th>
                  <th class="py-3.5 px-4 sm:px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/80">
                @for (sch of schedules(); track sch.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-4 px-4 sm:px-6">
                      <p class="font-bold text-white text-sm leading-snug">{{ sch.task_name }}</p>
                      <div class="flex items-center gap-1.5 mt-1">
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          Every {{ sch.frequency_interval_days }} days
                        </span>
                      </div>
                    </td>

                    <td class="py-4 px-4">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                          {{ sch.assets?.name?.charAt(0) }}
                        </div>
                        <div>
                          <p class="font-semibold text-white">{{ sch.assets?.name }}</p>
                          <p class="text-[11px] font-mono text-slate-400 mt-0.5">SN: {{ sch.assets?.serial_number }}</p>
                        </div>
                      </div>
                    </td>

                    <td class="py-4 px-4 text-slate-300">
                      {{ sch.assets?.location || 'Plant Floor' }}
                    </td>

                    <td class="py-4 px-4">
                      <p class="font-mono font-semibold text-slate-200">
                        {{ sch.next_due_date | date:'mediumDate' }}
                      </p>
                    </td>

                    <td class="py-4 px-4 text-slate-400 font-mono">
                      {{ sch.last_completed_at ? (sch.last_completed_at | date:'mediumDate') : 'Never' }}
                    </td>

                    <td class="py-4 px-4 sm:px-6 text-right">
                      @if (isOverdue(sch.next_due_date)) {
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                          OVERDUE
                        </span>
                      } @else if (isDueSoon(sch.next_due_date)) {
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          DUE SOON
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          SCHEDULED
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

      <!-- Create PM Rule Modal -->
      @if (showCreateModal()) {
        <app-schedule-create-modal
          (close)="showCreateModal.set(false)"
          (created)="loadSchedules()"
        />
      }
    </div>
  `
})
export class SchedulesComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  loading = signal<boolean>(true);
  triggering = signal<boolean>(false);
  schedules = signal<MaintenanceSchedule[]>([]);
  dueSoonOnly = signal<boolean>(false);
  showCreateModal = signal<boolean>(false);

  overdueCount = computed(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return this.schedules().filter((s) => new Date(s.next_due_date) <= today).length;
  });

  ngOnInit() {
    this.loadSchedules();
  }

  loadSchedules() {
    this.loading.set(true);
    this.api.getSchedules({ dueSoonOnly: this.dueSoonOnly() }).subscribe({
      next: (data) => {
        this.schedules.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.showError('Failed to load maintenance schedules');
        this.loading.set(false);
      },
    });
  }

  toggleDueSoon(checked: boolean) {
    this.dueSoonOnly.set(checked);
    this.loadSchedules();
  }

  isOverdue(dueDate: string): boolean {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return new Date(dueDate) <= today;
  }

  isDueSoon(dueDate: string): boolean {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const target = new Date(dueDate);
    const inSevenDays = new Date();
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    return target > today && target <= inSevenDays;
  }

  triggerDueCheck() {
    this.triggering.set(true);
    this.api.triggerDueCheck().subscribe({
      next: (res) => {
        this.triggering.set(false);
        this.toast.showSuccess(
          `Maintenance check complete: ${res.generatedCount} work order(s) generated.`,
          'Worker Triggered'
        );
        this.loadSchedules();
      },
      error: (err) => {
        this.triggering.set(false);
        this.toast.showError('Failed to trigger maintenance check worker');
      },
    });
  }
}
