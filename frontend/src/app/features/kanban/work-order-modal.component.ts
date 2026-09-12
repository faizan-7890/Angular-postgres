import { Component, output, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import {
  Asset,
  Technician,
  WorkOrderPriority,
  WorkOrderStatus,
  CreateWorkOrderDto,
} from '../../core/models/opstrack.models';

@Component({
  selector: 'app-work-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      (click)="close.emit()"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        (click)="$event.stopPropagation()"
        class="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100"
      >
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <h2 class="text-base font-bold text-white">Create Work Order</h2>
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
            <label class="block font-semibold text-slate-300 mb-1">Work Order Title *</label>
            <input
              type="text"
              [(ngModel)]="title"
              name="title"
              required
              placeholder="e.g. Inspect hydraulic valve seals"
              class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">Description / Task Scope</label>
            <textarea
              [(ngModel)]="description"
              name="description"
              rows="3"
              placeholder="Provide repair instructions or symptoms noted..."
              class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Equipment / Asset *</label>
              <select
                [(ngModel)]="assetId"
                name="assetId"
                required
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="" disabled>Select target equipment...</option>
                @for (asset of assets(); track asset.id) {
                  <option [value]="asset.id">{{ asset.name }} ({{ asset.location }})</option>
                }
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Assigned Technician</label>
              <select
                [(ngModel)]="technicianId"
                name="technicianId"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Unassigned</option>
                @for (tech of technicians(); track tech.id) {
                  <option [value]="tech.id">{{ tech.full_name }} ({{ tech.role }})</option>
                }
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Priority</label>
              <select
                [(ngModel)]="priority"
                name="priority"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Initial Status</label>
              <select
                [(ngModel)]="status"
                name="status"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Scheduled Date</label>
              <input
                type="date"
                [(ngModel)]="scheduledDate"
                name="scheduledDate"
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
              [disabled]="submitting() || !title || !assetId"
              class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
            >
              {{ submitting() ? 'Creating...' : 'Create Work Order' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class WorkOrderModalComponent implements OnInit {
  close = output<void>();
  created = output<void>();

  private api = inject(ApiService);
  private toast = inject(ToastService);

  assets = signal<Asset[]>([]);
  technicians = signal<Technician[]>([]);
  submitting = signal<boolean>(false);

  title = '';
  description = '';
  priority: WorkOrderPriority = 'MEDIUM';
  status: WorkOrderStatus = 'PENDING';
  assetId = '';
  technicianId = '';
  scheduledDate = new Date().toISOString().split('T')[0];

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close.emit();
  }

  ngOnInit() {
    this.api.getAssets().subscribe({
      next: (data) => {
        this.assets.set(data);
        if (data.length > 0) {
          this.assetId = data[0].id;
        }
      },
    });

    this.api.getTechnicians().subscribe({
      next: (data) => this.technicians.set(data),
    });
  }

  submit() {
    if (!this.title || !this.assetId) {
      this.toast.showError('Title and Asset are required.');
      return;
    }

    this.submitting.set(true);

    const dto: CreateWorkOrderDto = {
      title: this.title,
      description: this.description || undefined,
      priority: this.priority,
      status: this.status,
      asset_id: this.assetId,
      assigned_technician_id: this.technicianId || undefined,
      scheduled_date: this.scheduledDate || undefined,
    };

    this.api.createWorkOrder(dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.showSuccess(`Work order "${this.title}" created successfully`);
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = Array.isArray(err.error?.message)
          ? err.error.message.join(', ')
          : (err.error?.message || 'Failed to create work order');
        this.toast.showError(msg);
      },
    });
  }
}
