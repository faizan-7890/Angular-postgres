import { Component, output, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AssetStatus, CreateAssetDto } from '../../core/models/opstrack.models';

@Component({
  selector: 'app-asset-create-modal',
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
            <h2 class="text-base font-bold text-white">Register New Equipment</h2>
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
            <label class="block font-semibold text-slate-300 mb-1">Equipment Name *</label>
            <input
              type="text"
              [(ngModel)]="name"
              name="name"
              required
              placeholder="e.g. Centrifugal Slurry Pump P-102"
              class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Serial Number *</label>
              <input
                type="text"
                [(ngModel)]="serialNumber"
                name="serialNumber"
                required
                placeholder="e.g. CSP-102-4412"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Category *</label>
              <input
                type="text"
                [(ngModel)]="category"
                name="category"
                required
                placeholder="e.g. Heavy Machinery"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Physical Location *</label>
              <input
                type="text"
                [(ngModel)]="location"
                name="location"
                required
                placeholder="e.g. Building B - Process Bay 3"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Initial Status</label>
              <select
                [(ngModel)]="status"
                name="status"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="OPERATIONAL">OPERATIONAL</option>
                <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
                <option value="IN_STORAGE">IN_STORAGE</option>
                <option value="DECOMMISSIONED">DECOMMISSIONED</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Commission / Purchase Date</label>
              <input
                type="date"
                [(ngModel)]="purchaseDate"
                name="purchaseDate"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Warranty Expiration Date</label>
              <input
                type="date"
                [(ngModel)]="warrantyDate"
                name="warrantyDate"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

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
              [disabled]="submitting() || !name || !serialNumber || !category || !location"
              class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
            >
              {{ submitting() ? 'Saving Equipment...' : 'Register Equipment' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AssetCreateModalComponent {
  close = output<void>();
  created = output<void>();

  private api = inject(ApiService);
  private toast = inject(ToastService);

  name = '';
  serialNumber = '';
  category = 'Heavy Machinery';
  location = '';
  status: AssetStatus = 'OPERATIONAL';
  purchaseDate = '';
  warrantyDate = '';

  submitting = signal<boolean>(false);

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close.emit();
  }

  submit() {
    if (!this.name || !this.serialNumber || !this.category || !this.location) {
      this.toast.showError('Please fill in all required fields');
      return;
    }

    if (this.purchaseDate && this.warrantyDate && new Date(this.purchaseDate) > new Date(this.warrantyDate)) {
      this.toast.showError('Warranty expiration date cannot be earlier than purchase date');
      return;
    }

    this.submitting.set(true);

    const dto: CreateAssetDto = {
      name: this.name,
      serial_number: this.serialNumber,
      category: this.category,
      location: this.location,
      status: this.status,
      purchase_date: this.purchaseDate || undefined,
      warranty_expires_at: this.warrantyDate || undefined,
      specs: {},
    };

    this.api.createAsset(dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.showSuccess(`Asset "${this.name}" registered successfully`);
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = Array.isArray(err.error?.message)
          ? err.error.message.join(', ')
          : (err.error?.message || 'Failed to register equipment');
        this.toast.showError(msg);
      },
    });
  }
}
