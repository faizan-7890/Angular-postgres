import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Asset, AssetStatus } from '../../core/models/opstrack.models';
import { AssetQrModalComponent } from './asset-qr-modal.component';
import { AssetDetailModalComponent } from './asset-detail-modal.component';
import { AssetCreateModalComponent } from './asset-create-modal.component';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AssetQrModalComponent,
    AssetDetailModalComponent,
    AssetCreateModalComponent,
  ],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <!-- Header & Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Equipment & Asset Directory
            <span class="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              {{ assets().length }} Registered
            </span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">
            Track machinery specifications, generate printable QR badges, and inspect maintenance records.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            (click)="showCreateModal.set(true)"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Register Equipment
          </button>
        </div>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col md:flex-row items-center gap-4">
        <!-- Live Debounced Full-Text Search Input -->
        <div class="relative flex-1 w-full">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchInput($event)"
            placeholder="Full-text search assets (e.g. Compressor, Hydraulic, Bay 4)..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          @if (isSearching()) {
            <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
              <div class="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
        </div>

        <!-- Filter Dropdowns: Category & Status -->
        <div class="flex items-center gap-3 w-full md:w-auto">
          <!-- Category Filter -->
          <select
            [ngModel]="selectedCategory()"
            (ngModelChange)="onCategoryChange($event)"
            class="flex-1 md:w-44 px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            @for (cat of availableCategories(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>

          <!-- Status Filter -->
          <select
            [ngModel]="selectedStatus()"
            (ngModelChange)="onStatusChange($event)"
            class="flex-1 md:w-44 px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="OPERATIONAL">OPERATIONAL</option>
            <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
            <option value="IN_STORAGE">IN_STORAGE</option>
            <option value="DECOMMISSIONED">DECOMMISSIONED</option>
          </select>

          <!-- Reset Filter Button -->
          @if (searchQuery() || selectedCategory() || selectedStatus()) {
            <button
              (click)="resetFilters()"
              class="px-3 py-2.5 rounded-xl bg-slate-800 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors"
              title="Clear Filters"
            >
              Reset
            </button>
          }
        </div>
      </div>

      <!-- Assets Table / Grid -->
      <div class="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        @if (loading()) {
          <div class="p-16 text-center text-slate-400">
            <div class="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p class="text-sm">Fetching equipment records from PostgreSQL...</p>
          </div>
        } @else if (assets().length === 0) {
          <div class="p-16 text-center">
            <div class="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <p class="text-slate-300 font-semibold text-sm">No Matching Equipment Found</p>
            <p class="text-slate-500 text-xs mt-1">Try adjusting your search keywords or filter selections.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                  <th class="py-3.5 px-4 sm:px-6">Equipment / Serial</th>
                  <th class="py-3.5 px-4">Category</th>
                  <th class="py-3.5 px-4">Location</th>
                  <th class="py-3.5 px-4">Status</th>
                  <th class="py-3.5 px-4 text-center">Schedules / WO</th>
                  <th class="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/80">
                @for (asset of assets(); track asset.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors group">
                    <td class="py-4 px-4 sm:px-6">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-700/80 flex-shrink-0 group-hover:border-blue-500/50 transition-colors">
                          {{ asset.name.charAt(0) }}
                        </div>
                        <div>
                          <p class="font-bold text-white text-sm group-hover:text-blue-400 transition-colors cursor-pointer" (click)="viewDetails(asset)">
                            {{ asset.name }}
                          </p>
                          <p class="font-mono text-[11px] text-slate-400 mt-0.5">SN: {{ asset.serial_number }}</p>
                        </div>
                      </div>
                    </td>

                    <td class="py-4 px-4">
                      <span class="px-2 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
                        {{ asset.category }}
                      </span>
                    </td>

                    <td class="py-4 px-4 text-slate-300">
                      <div class="flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>{{ asset.location }}</span>
                      </div>
                    </td>

                    <td class="py-4 px-4">
                      <span
                        class="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1.5"
                        [ngClass]="{
                          'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30': asset.status === 'OPERATIONAL',
                          'bg-amber-500/15 text-amber-300 border border-amber-500/30': asset.status === 'UNDER_MAINTENANCE',
                          'bg-slate-700/30 text-slate-400 border border-slate-600': asset.status === 'DECOMMISSIONED' || asset.status === 'IN_STORAGE'
                        }"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" [ngClass]="{
                          'bg-emerald-400': asset.status === 'OPERATIONAL',
                          'bg-amber-400': asset.status === 'UNDER_MAINTENANCE',
                          'bg-slate-400': asset.status === 'DECOMMISSIONED' || asset.status === 'IN_STORAGE'
                        }"></span>
                        {{ asset.status }}
                      </span>
                    </td>

                    <td class="py-4 px-4 text-center">
                      <span class="text-xs font-mono text-slate-300">
                        {{ asset.maintenance_schedules?.length || 0 }} PM / {{ asset._count?.work_orders ?? 0 }} WO
                      </span>
                    </td>

                    <td class="py-4 px-4 sm:px-6 text-right">
                      <div class="inline-flex items-center gap-1.5">
                        <!-- Print QR Badge Button -->
                        <button
                          (click)="openQrModal(asset)"
                          class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-blue-400 border border-slate-700 transition-colors"
                          title="Print QR Tag"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                          </svg>
                        </button>

                        <!-- View Details Button -->
                        <button
                          (click)="viewDetails(asset)"
                          class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                          title="View Details"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- QR Badge Printable Modal -->
      @if (selectedQrAsset(); as asset) {
        <app-asset-qr-modal
          [asset]="asset"
          (close)="selectedQrAsset.set(null)"
        />
      }

      <!-- Detailed Asset Metadata Modal -->
      @if (selectedDetailAssetId(); as id) {
        <app-asset-detail-modal
          [assetId]="id"
          (close)="selectedDetailAssetId.set(null)"
          (printQr)="openQrFromDetail($event)"
        />
      }

      <!-- Create New Equipment Modal -->
      @if (showCreateModal()) {
        <app-asset-create-modal
          (close)="showCreateModal.set(false)"
          (created)="onAssetCreated()"
        />
      }
    </div>
  `
})
export class AssetsComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  loading = signal<boolean>(true);
  isSearching = signal<boolean>(false);
  assets = signal<Asset[]>([]);

  searchQuery = signal<string>('');
  selectedCategory = signal<string>('');
  selectedStatus = signal<string>('');

  selectedQrAsset = signal<Asset | null>(null);
  selectedDetailAssetId = signal<string | null>(null);
  showCreateModal = signal<boolean>(false);

  availableCategories = computed(() => {
    const list = this.assets();
    const defaults = ['Pneumatics', 'Cooling & Ventilation', 'Heavy Machinery', 'Fabrication', 'Power Generation'];
    const fromAssets = list.map((a) => a.category).filter(Boolean);
    return Array.from(new Set([...defaults, ...fromAssets]));
  });

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  ngOnInit() {
    this.setupSearchSubscription();
    this.loadAssets();
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

  setupSearchSubscription() {
    this.searchSub = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((query) => {
        this.executeSearch(query);
      });
  }

  onSearchInput(query: string) {
    this.searchQuery.set(query);
    this.isSearching.set(true);
    this.searchSubject.next(query);
  }

  executeSearch(query: string) {
    if (!query || query.trim() === '') {
      this.loadAssets();
      return;
    }

    this.api.searchAssets(query.trim()).subscribe({
      next: (results) => {
        // If category or status filter is also active, filter locally
        let filtered = results;
        if (this.selectedCategory()) {
          filtered = filtered.filter((a) => a.category === this.selectedCategory());
        }
        if (this.selectedStatus()) {
          filtered = filtered.filter((a) => a.status === this.selectedStatus());
        }
        this.assets.set(filtered);
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Search error:', err);
        this.isSearching.set(false);
        this.toast.showError('Full-text search query failed');
      },
    });
  }

  onCategoryChange(cat: string) {
    this.selectedCategory.set(cat);
    if (this.searchQuery().trim()) {
      this.executeSearch(this.searchQuery());
    } else {
      this.loadAssets();
    }
  }

  onStatusChange(stat: string) {
    this.selectedStatus.set(stat);
    if (this.searchQuery().trim()) {
      this.executeSearch(this.searchQuery());
    } else {
      this.loadAssets();
    }
  }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.selectedStatus.set('');
    this.loadAssets();
  }

  loadAssets() {
    this.loading.set(true);
    const params: { category?: string; status?: string } = {};
    if (this.selectedCategory()) params.category = this.selectedCategory();
    if (this.selectedStatus()) params.status = this.selectedStatus();

    this.api.getAssets(params).subscribe({
      next: (data) => {
        this.assets.set(data);
        this.loading.set(false);
        this.isSearching.set(false);
      },
      error: (err) => {
        this.toast.showError('Failed to retrieve assets');
        this.loading.set(false);
        this.isSearching.set(false);
      },
    });
  }

  openQrModal(asset: Asset) {
    this.selectedQrAsset.set(asset);
  }

  openQrFromDetail(asset: Asset) {
    this.selectedDetailAssetId.set(null);
    this.selectedQrAsset.set(asset);
  }

  viewDetails(asset: Asset) {
    this.selectedDetailAssetId.set(asset.id);
  }

  onAssetCreated() {
    this.loadAssets();
  }
}
