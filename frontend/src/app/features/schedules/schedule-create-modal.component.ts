import { Component, output, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Asset, CreateScheduleDto } from '../../core/models/opstrack.models';

@Component({
  selector: 'app-schedule-create-modal',
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
            <h2 class="text-base font-bold text-white">Create PM Schedule Rule</h2>
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
            <label class="block font-semibold text-slate-300 mb-1">Target Equipment *</label>
            <select
              [(ngModel)]="assetId"
              name="assetId"
              required
              class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="" disabled>Select equipment...</option>
              @for (asset of assets(); track asset.id) {
                <option [value]="asset.id">{{ asset.name }} ({{ asset.serial_number }})</option>
              }
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">Maintenance Task Name *</label>
            <input
              type="text"
              [(ngModel)]="taskName"
              name="taskName"
              required
              placeholder="e.g. Hydraulic Fluid & Seal Inspection"
              class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Frequency Interval (Days) *</label>
              <input
                type="number"
                min="1"
                [(ngModel)]="frequencyDays"
                name="frequencyDays"
                required
                placeholder="e.g. 90"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Next Due Date *</label>
              <input
                type="date"
                [(ngModel)]="nextDueDate"
                name="nextDueDate"
                required
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
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
              [disabled]="submitting() || !assetId || !taskName || !frequencyDays || !nextDueDate"
              class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
            >
              {{ submitting() ? 'Saving...' : 'Create PM Schedule' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ScheduleCreateModalComponent implements OnInit {
  close = output<void>();
  created = output<void>();

  private api = inject(ApiService);
  private toast = inject(ToastService);

  assets = signal<Asset[]>([]);
  submitting = signal<boolean>(false);

  assetId = '';
  taskName = '';
  frequencyDays = 60;
  nextDueDate = '';

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close.emit();
  }

  ngOnInit() {
    // Set default next due date to 30 days from now
    const d = new Date();
    d.setDate(d.getDate() + 30);
    this.nextDueDate = d.toISOString().split('T')[0];

    this.api.getAssets().subscribe({
      next: (data) => {
        this.assets.set(data);
        if (data.length > 0) {
          this.assetId = data[0].id;
        }
      },
    });
  }

  submit() {
    if (!this.assetId || !this.taskName || !this.frequencyDays || !this.nextDueDate) {
      this.toast.showError('All fields are required');
      return;
    }

    if (
      !Number.isInteger(Number(this.frequencyDays)) ||
      Number(this.frequencyDays) <= 0
    ) {
      this.toast.showError('Frequency interval must be a positive whole number of days.');
      return;
    }

    this.submitting.set(true);

    const dto: CreateScheduleDto = {
      asset_id: this.assetId,
      task_name: this.taskName,
      frequency_interval_days: Number(this.frequencyDays),
      next_due_date: this.nextDueDate,
    };

    this.api.createSchedule(dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.showSuccess(`PM schedule "${this.taskName}" created successfully`);
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = Array.isArray(err.error?.message)
          ? err.error.message.join(', ')
          : (err.error?.message || 'Failed to create maintenance schedule');
        this.toast.showError(msg);
      },
    });
  }
}
