import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Mobile Backdrop -->
    @if (isOpen()) {
      <div
        (click)="closeSidebar.emit()"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
      ></div>
    }

    <!-- Sidebar Container -->
    <aside
      class="fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0"
      [class.translate-x-0]="isOpen()"
      [class.-translate-x-full]="!isOpen()"
    >
      <!-- Brand / Logo -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <span class="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              OpsTrack
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">CMMS</span>
            </span>
            <p class="text-[11px] text-slate-400 font-medium">Enterprise Maintenance</p>
          </div>
        </div>

        <!-- Close button on mobile -->
        <button
          (click)="closeSidebar.emit()"
          class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close sidebar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p class="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-2">Main Navigation</p>

        <!-- Dashboard -->
        <a
          routerLink="/dashboard"
          routerLinkActive="bg-blue-600/15 text-blue-400 border-blue-500 font-semibold shadow-inner"
          (click)="closeSidebar.emit()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all group border border-transparent"
        >
          <svg class="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          </svg>
          <span class="text-sm">Dashboard</span>
        </a>

        <!-- Assets -->
        <a
          routerLink="/assets"
          routerLinkActive="bg-blue-600/15 text-blue-400 border-blue-500 font-semibold shadow-inner"
          (click)="closeSidebar.emit()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all group border border-transparent"
        >
          <svg class="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          <span class="text-sm">Assets Directory</span>
        </a>

        <!-- Work Orders Kanban -->
        <a
          routerLink="/kanban"
          routerLinkActive="bg-blue-600/15 text-blue-400 border-blue-500 font-semibold shadow-inner"
          (click)="closeSidebar.emit()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all group border border-transparent"
        >
          <svg class="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
          </svg>
          <span class="text-sm">Work Orders Kanban</span>
        </a>

        <!-- Maintenance Schedules -->
        <a
          routerLink="/schedules"
          routerLinkActive="bg-blue-600/15 text-blue-400 border-blue-500 font-semibold shadow-inner"
          (click)="closeSidebar.emit()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all group border border-transparent"
        >
          <svg class="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span class="text-sm">Maintenance Schedules</span>
        </a>

        <!-- Spare Parts Inventory -->
        <a
          routerLink="/inventory"
          routerLinkActive="bg-blue-600/15 text-blue-400 border-blue-500 font-semibold shadow-inner"
          (click)="closeSidebar.emit()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all group border border-transparent"
        >
          <svg class="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <span class="text-sm">Spare Parts Inventory</span>
        </a>
      </nav>

      <!-- Footer / Status indicator -->
      <div class="p-4 border-t border-slate-800 bg-slate-900/80">
        <div class="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-slate-200 truncate">Backend Connected</p>
            <p class="text-[11px] text-slate-400 font-mono truncate">localhost:3000</p>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  isOpen = input<boolean>(false);
  closeSidebar = output<void>();
}
