import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeMode } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between transition-colors duration-200">
      <!-- Left: Mobile menu button & breadcrumbs -->
      <div class="flex items-center gap-4">
        <button
          (click)="toggleSidebar.emit()"
          class="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">Operations</span>
          <span class="text-slate-400 dark:text-slate-600">/</span>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">CMMS Control Hub</span>
        </div>
      </div>

      <!-- Right: Theme Toggle, Live Status & User Info -->
      <div class="flex items-center gap-3">
        <!-- Theme Switcher Button -->
        <button
          (click)="themeService.toggleTheme()"
          [title]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          class="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400/50 transition-all flex items-center gap-1.5 text-xs font-medium shadow-sm"
          aria-label="Toggle Theme"
        >
          @if (themeService.isDark()) {
            <!-- Sun Icon (for switching to light) -->
            <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <span class="hidden sm:inline">Light</span>
          } @else {
            <!-- Moon Icon (for switching to dark) -->
            <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
            <span class="hidden sm:inline">Dark</span>
          }
        </button>

        <!-- Live System Indicator -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <span class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
          <span>API Online (PostgreSQL Live)</span>
        </div>

        <!-- User Profile Pill -->
        <div class="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-400 shadow-sm">
            OP
          </div>
          <div class="hidden md:block text-left">
            <p class="text-xs font-semibold text-slate-800 dark:text-slate-200">Ops Supervisor</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400">Plant Alpha</p>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  toggleSidebar = output<void>();
  themeService = inject(ThemeService);
}
