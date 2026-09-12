import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <!-- Left: Mobile menu button & breadcrumbs -->
      <div class="flex items-center gap-4">
        <button
          (click)="toggleSidebar.emit()"
          class="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">Operations</span>
          <span class="text-slate-600">/</span>
          <span class="text-sm font-medium text-slate-300">CMMS Control Hub</span>
        </div>
      </div>

      <!-- Right: Actions & User Info -->
      <div class="flex items-center gap-3">
        <!-- Live System Indicator -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>API Online (PostgreSQL Live)</span>
        </div>

        <!-- User Profile Pill -->
        <div class="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
            OP
          </div>
          <div class="hidden md:block text-left">
            <p class="text-xs font-semibold text-slate-200">Ops Supervisor</p>
            <p class="text-[10px] text-slate-400">Plant Alpha</p>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  toggleSidebar = output<void>();
}
