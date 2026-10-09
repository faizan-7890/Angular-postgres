import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaintenanceSchedule } from '../../core/models/opstrack.models';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  tasks: MaintenanceSchedule[];
}

@Component({
  selector: 'app-schedule-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Calendar Controls & Navigation Bar -->
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Month Navigation -->
        <div class="flex items-center gap-3">
          <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              (click)="previousMonth()"
              class="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
              aria-label="Previous Month"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button
              (click)="goToToday()"
              class="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Today
            </button>
            <button
              (click)="nextMonth()"
              class="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
              aria-label="Next Month"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <h2 class="text-lg font-bold text-slate-900 dark:text-white min-w-44">
            {{ currentMonthName() }} {{ currentYear() }}
          </h2>
        </div>

        <!-- View Format Toggle: Grid vs Timeline Agenda -->
        <div class="flex items-center gap-3">
          <div class="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold">
            <button
              (click)="calendarMode.set('grid')"
              [ngClass]="calendarMode() === 'grid' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'"
              class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
              Month Grid
            </button>
            <button
              (click)="calendarMode.set('agenda')"
              [ngClass]="calendarMode() === 'agenda' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'"
              class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
              Timeline Agenda
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Summary Badges -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p class="text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase">This Month</p>
          <p class="text-xl font-black text-slate-900 dark:text-white mt-0.5">{{ thisMonthTaskCount() }} Tasks</p>
        </div>
        <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p class="text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase">Next 7 Days</p>
          <p class="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{{ dueSoonCount() }} Due</p>
        </div>
        <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p class="text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase">Overdue</p>
          <p class="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{{ overdueCount() }} Backlog</p>
        </div>
        <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p class="text-slate-500 dark:text-slate-400 text-[11px] font-medium uppercase">Total PM Rules</p>
          <p class="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{{ schedules().length }} Active</p>
        </div>
      </div>

      <!-- VIEW 1: MONTH GRID VIEW -->
      @if (calendarMode() === 'grid') {
        <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <!-- Weekday Headers -->
          <div class="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase py-3">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <!-- Calendar Days Grid -->
          <div class="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 dark:divide-slate-800">
            @for (day of calendarDays(); track day.date.toISOString()) {
              <div
                class="min-h-28 p-2 transition-colors flex flex-col justify-between"
                [ngClass]="{
                  'bg-white dark:bg-slate-900': day.isCurrentMonth,
                  'bg-slate-50/50 dark:bg-slate-950/40': !day.isCurrentMonth,
                  'ring-2 ring-blue-500 ring-inset': day.isToday
                }"
              >
                <!-- Day Number Header -->
                <div class="flex items-center justify-between mb-1.5">
                  <span
                    class="text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center"
                    [ngClass]="{
                      'bg-blue-600 text-white': day.isToday,
                      'text-slate-700 dark:text-slate-300': day.isCurrentMonth && !day.isToday,
                      'text-slate-400 dark:text-slate-600': !day.isCurrentMonth
                    }"
                  >
                    {{ day.dayNumber }}
                  </span>

                  @if (day.tasks.length > 0) {
                    <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {{ day.tasks.length }}
                    </span>
                  }
                </div>

                <!-- Tasks Due on this Day -->
                <div class="space-y-1 overflow-y-auto max-h-24">
                  @for (task of day.tasks; track task.id) {
                    <div
                      (click)="selectedTask.set(task)"
                      class="p-1 rounded-md text-[10px] font-medium truncate cursor-pointer transition-transform hover:scale-[1.02] shadow-xs"
                      [ngClass]="{
                        'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30': day.isPast,
                        'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30': !day.isPast && isDueSoonDate(day.date),
                        'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30': !day.isPast && !isDueSoonDate(day.date)
                      }"
                      [title]="task.task_name + ' (' + (task.assets?.name || 'Equipment') + ')'"
                    >
                      <span class="font-bold">&bull;</span> {{ task.task_name }}
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- VIEW 2: TIMELINE AGENDA VIEW -->
      @if (calendarMode() === 'agenda') {
        <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Upcoming Maintenance Timeline</h3>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-mono">{{ sortedSchedules().length }} Total Schedules</span>
          </div>

          @if (sortedSchedules().length === 0) {
            <div class="py-12 text-center text-slate-400 text-xs">No upcoming schedules found.</div>
          } @else {
            <div class="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              @for (item of sortedSchedules(); track item.id) {
                <div class="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all">
                  <!-- Timeline Node Dot -->
                  <span
                    class="absolute -left-[27px] top-5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ring-2"
                    [ngClass]="{
                      'bg-rose-500 ring-rose-500/30': isOverdueDate(item.next_due_date),
                      'bg-amber-500 ring-amber-500/30': !isOverdueDate(item.next_due_date) && isDueSoonDateString(item.next_due_date),
                      'bg-blue-500 ring-blue-500/30': !isOverdueDate(item.next_due_date) && !isDueSoonDateString(item.next_due_date)
                    }"
                  ></span>

                  <!-- Details -->
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30': isOverdueDate(item.next_due_date),
                          'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30': !isOverdueDate(item.next_due_date) && isDueSoonDateString(item.next_due_date),
                          'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30': !isOverdueDate(item.next_due_date) && !isDueSoonDateString(item.next_due_date)
                        }"
                      >
                        {{ isOverdueDate(item.next_due_date) ? 'OVERDUE' : (isDueSoonDateString(item.next_due_date) ? 'DUE SOON' : 'SCHEDULED') }}
                      </span>
                      <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Every {{ item.frequency_interval_days }} days
                      </span>
                    </div>

                    <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ item.task_name }}</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      <span class="text-slate-700 dark:text-slate-300 font-semibold">{{ item.assets?.name }}</span> &bull; {{ item.assets?.location }}
                    </p>
                  </div>

                  <!-- Date & Action -->
                  <div class="flex items-center gap-4 flex-shrink-0">
                    <div class="text-right">
                      <p class="text-xs font-bold font-mono text-slate-900 dark:text-white">{{ item.next_due_date | date:'mediumDate' }}</p>
                      <p class="text-[11px] text-slate-500 dark:text-slate-400">
                        Last: {{ item.last_completed_at ? (item.last_completed_at | date:'shortDate') : 'Never' }}
                      </p>
                    </div>

                    <button
                      (click)="selectedTask.set(item)"
                      class="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-sm"
                    >
                      Details
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Task Details Popover Dialog -->
      @if (selectedTask(); as task) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div class="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Schedule Details</h3>
              <button
                (click)="selectedTask.set(null)"
                class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <span class="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">Task Description</span>
                <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{{ task.task_name }}</p>
              </div>

              <div class="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div>
                  <span class="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Target Equipment</span>
                  <p class="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ task.assets?.name }}</p>
                  <p class="text-[11px] font-mono text-slate-400">SN: {{ task.assets?.serial_number }}</p>
                </div>
                <div>
                  <span class="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Location</span>
                  <p class="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{{ task.assets?.location }}</p>
                  <p class="text-[11px] text-slate-400">{{ task.assets?.category }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <span class="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Recurrence</span>
                  <p class="font-mono text-slate-800 dark:text-slate-200 font-semibold mt-0.5">Every {{ task.frequency_interval_days }} days</p>
                </div>
                <div>
                  <span class="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Next Due Date</span>
                  <p class="font-mono text-slate-800 dark:text-slate-200 font-semibold mt-0.5">{{ task.next_due_date | date:'mediumDate' }}</p>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                (click)="selectedTask.set(null)"
                class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ScheduleCalendarComponent {
  schedules = input<MaintenanceSchedule[]>([]);

  calendarMode = signal<'grid' | 'agenda'>('grid');
  currentDate = signal<Date>(new Date());
  selectedTask = signal<MaintenanceSchedule | null>(null);

  currentMonthName = computed(() => {
    return this.currentDate().toLocaleString('default', { month: 'long' });
  });

  currentYear = computed(() => this.currentDate().getFullYear());

  sortedSchedules = computed(() => {
    return [...this.schedules()].sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime());
  });

  thisMonthTaskCount = computed(() => {
    const curMonth = this.currentDate().getMonth();
    const curYear = this.currentDate().getFullYear();
    return this.schedules().filter((s) => {
      const d = new Date(s.next_due_date);
      return d.getMonth() === curMonth && d.getFullYear() === curYear;
    }).length;
  });

  overdueCount = computed(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return this.schedules().filter((s) => new Date(s.next_due_date) <= today).length;
  });

  dueSoonCount = computed(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const inSevenDays = new Date();
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    return this.schedules().filter((s) => {
      const d = new Date(s.next_due_date);
      return d > today && d <= inSevenDays;
    }).length;
  });

  calendarDays = computed<CalendarDay[]>(() => {
    const viewDate = this.currentDate();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = lastDayOfMonth.getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(this.createCalendarDay(d, false, today));
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      days.push(this.createCalendarDay(d, true, today));
    }

    // Next month padding to fill complete 7-day rows (up to 35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push(this.createCalendarDay(d, false, today));
    }

    return days;
  });

  private createCalendarDay(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
    const dayNumber = date.getDate();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    const isPast = date < today;

    // Filter tasks due on this specific date
    const tasks = this.schedules().filter((s) => {
      const taskDate = new Date(s.next_due_date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });

    return {
      date,
      dayNumber,
      isCurrentMonth,
      isToday,
      isPast,
      tasks,
    };
  }

  previousMonth() {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth() {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  goToToday() {
    this.currentDate.set(new Date());
  }

  isOverdueDate(dueDate: string): boolean {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return new Date(dueDate) <= today;
  }

  isDueSoonDate(date: Date): boolean {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const inSevenDays = new Date();
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    return date > today && date <= inSevenDays;
  }

  isDueSoonDateString(dueDate: string): boolean {
    return this.isDueSoonDate(new Date(dueDate));
  }
}
