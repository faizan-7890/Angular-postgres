import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Asset } from '../../../core/models/opstrack.models';

interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
  operational: number;
  maintenance: number;
  other: number;
}

@Component({
  selector: 'app-asset-category-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Fleet Equipment Health</span>
            <span class="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
              {{ operationalRate() }}% Operational
            </span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Asset distribution and operational status by equipment category
          </p>
        </div>

        <div class="hidden sm:flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Operational
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span> Under Maint.
          </span>
        </div>
      </div>

      <!-- Categories Progress Bars -->
      @if (categories().length === 0) {
        <div class="py-12 text-center text-slate-400 text-xs">
          No equipment registered in the directory.
        </div>
      } @else {
        <div class="space-y-4">
          @for (cat of categories(); track cat.category) {
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  {{ cat.category }}
                </span>
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-slate-900 dark:text-white">{{ cat.total }} unit{{ cat.total > 1 ? 's' : '' }}</span>
                  <span class="text-[11px] font-mono text-slate-400">({{ cat.percentage }}%)</span>
                </div>
              </div>

              <!-- Segmented Progress Bar -->
              <div class="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <!-- Operational segment -->
                @if (cat.operational > 0) {
                  <div
                    class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    [style.width.%]="(cat.operational / cat.total) * 100"
                    [title]="cat.operational + ' Operational'"
                  ></div>
                }
                <!-- Maintenance segment -->
                @if (cat.maintenance > 0) {
                  <div
                    class="h-full bg-amber-500 transition-all duration-500"
                    [style.width.%]="(cat.maintenance / cat.total) * 100"
                    [title]="cat.maintenance + ' Under Maintenance'"
                  ></div>
                }
                <!-- Other (In Storage/Decommissioned) segment -->
                @if (cat.other > 0) {
                  <div
                    class="h-full bg-slate-400 dark:bg-slate-600 transition-all duration-500"
                    [style.width.%]="(cat.other / cat.total) * 100"
                    [title]="cat.other + ' In Storage / Decommissioned'"
                  ></div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Bottom Summary Footer -->
      <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Fleet Size: <strong class="text-slate-800 dark:text-slate-200">{{ totalAssets() }}</strong> Units</span>
        <span>Categories: <strong class="text-slate-800 dark:text-slate-200">{{ categories().length }}</strong> Types</span>
      </div>
    </div>
  `
})
export class AssetCategoryChartComponent {
  assets = input<Asset[]>([]);

  totalAssets = computed(() => this.assets().length);

  operationalRate = computed(() => {
    const list = this.assets();
    if (list.length === 0) return 0;
    const op = list.filter((a) => a.status === 'OPERATIONAL').length;
    return Math.round((op / list.length) * 100);
  });

  categories = computed<CategoryBreakdown[]>(() => {
    const list = this.assets();
    const total = list.length;
    if (total === 0) return [];

    const map = new Map<string, { total: number; operational: number; maintenance: number; other: number }>();

    for (const a of list) {
      const cat = a.category || 'General';
      const existing = map.get(cat) || { total: 0, operational: 0, maintenance: 0, other: 0 };
      existing.total++;
      if (a.status === 'OPERATIONAL') existing.operational++;
      else if (a.status === 'UNDER_MAINTENANCE') existing.maintenance++;
      else existing.other++;
      map.set(cat, existing);
    }

    return Array.from(map.entries())
      .map(([category, stats]) => ({
        category,
        total: stats.total,
        percentage: Math.round((stats.total / total) * 100),
        operational: stats.operational,
        maintenance: stats.maintenance,
        other: stats.other,
      }))
      .sort((a, b) => b.total - a.total);
  });
}
