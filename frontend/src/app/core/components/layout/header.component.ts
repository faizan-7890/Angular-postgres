import { Component, output, inject, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { ClerkAuthService } from '../../services/clerk-auth.service';
import { UserRole } from '../../models/auth.models';

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

      <!-- Right: Theme Toggle, Live Status & Clerk User Info -->
      <div class="flex items-center gap-3">
        <!-- Theme Switcher Button -->
        <button
          (click)="themeService.toggleTheme()"
          [title]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          class="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400/50 transition-all flex items-center gap-1.5 text-xs font-medium shadow-sm"
          aria-label="Toggle Theme"
        >
          @if (themeService.isDark()) {
            <!-- Sun Icon -->
            <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <span class="hidden sm:inline">Light</span>
          } @else {
            <!-- Moon Icon -->
            <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
            <span class="hidden sm:inline">Dark</span>
          }
        </button>

        <!-- Live System Indicator -->
        <div class="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <span class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
          <span>PostgreSQL Active</span>
        </div>

        <!-- Clerk Live User Button or Interactive User Dropdown -->
        @if (!authService.isDevMode()) {
          <div #clerkUserButtonContainer id="clerk-user-button"></div>
        } @else {
          <!-- User Profile & Role Switcher Pill -->
          <div class="relative">
            <button
              (click)="menuOpen.set(!menuOpen())"
              class="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left shadow-sm"
              title="Click to view profile & switch RBAC roles"
            >
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ring-1"
                [ngClass]="{
                  'bg-purple-500/20 text-purple-600 dark:text-purple-400 ring-purple-500/30': authService.userRole() === 'ADMIN',
                  'bg-blue-500/20 text-blue-600 dark:text-blue-400 ring-blue-500/30': authService.userRole() === 'MANAGER',
                  'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-emerald-500/30': authService.userRole() === 'TECHNICIAN',
                  'bg-slate-500/20 text-slate-600 dark:text-slate-400 ring-slate-500/30': authService.userRole() === 'VIEWER'
                }"
              >
                {{ getInitials() }}
              </div>
              <div class="hidden md:block">
                <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {{ authService.user()?.fullName || 'User' }}
                </p>
                <div class="flex items-center gap-1.5">
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded"
                    [ngClass]="{
                      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300': authService.userRole() === 'ADMIN',
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300': authService.userRole() === 'MANAGER',
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300': authService.userRole() === 'TECHNICIAN',
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300': authService.userRole() === 'VIEWER'
                    }"
                  >
                    {{ authService.userRole() }}
                  </span>
                </div>
              </div>
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- Dropdown Menu for RBAC Testing & Logout -->
            @if (menuOpen()) {
              <div class="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div class="px-3 py-2 border-b border-slate-100 dark:border-slate-800/60 mb-1.5">
                  <p class="text-xs font-semibold text-slate-900 dark:text-white">{{ authService.user()?.fullName }}</p>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ authService.user()?.email }}</p>
                </div>

                <p class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Switch Active Role (RBAC)
                </p>

                <div class="space-y-1 mb-2">
                  <button
                    (click)="switchRole('ADMIN')"
                    [ngClass]="{ 'bg-purple-50 dark:bg-purple-900/20': authService.userRole() === 'ADMIN' }"
                    class="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                      Administrator
                    </span>
                    @if (authService.userRole() === 'ADMIN') {
                      <span class="text-purple-600 text-xs font-bold">&check;</span>
                    }
                  </button>

                  <button
                    (click)="switchRole('MANAGER')"
                    [ngClass]="{ 'bg-blue-50 dark:bg-blue-900/20': authService.userRole() === 'MANAGER' }"
                    class="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                      Manager (Supervisor)
                    </span>
                    @if (authService.userRole() === 'MANAGER') {
                      <span class="text-blue-600 text-xs font-bold">&check;</span>
                    }
                  </button>

                  <button
                    (click)="switchRole('TECHNICIAN')"
                    [ngClass]="{ 'bg-emerald-50 dark:bg-emerald-900/20': authService.userRole() === 'TECHNICIAN' }"
                    class="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Field Technician
                    </span>
                    @if (authService.userRole() === 'TECHNICIAN') {
                      <span class="text-emerald-600 text-xs font-bold">&check;</span>
                    }
                  </button>
                </div>

                <div class="border-t border-slate-100 dark:border-slate-800/60 pt-1.5">
                  <button
                    (click)="logout()"
                    class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Sign Out / Switch Account
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </header>
  `
})
export class HeaderComponent implements AfterViewInit {
  @ViewChild('clerkUserButtonContainer') clerkUserButton?: ElementRef<HTMLDivElement>;

  toggleSidebar = output<void>();
  themeService = inject(ThemeService);
  authService = inject(ClerkAuthService);
  router = inject(Router);

  menuOpen = signal<boolean>(false);

  ngAfterViewInit(): void {
    if (!this.authService.isDevMode() && this.clerkUserButton?.nativeElement) {
      this.authService.mountUserButton(this.clerkUserButton.nativeElement);
    }
  }

  getInitials(): string {
    const name = this.authService.user()?.fullName || 'User';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  switchRole(role: UserRole): void {
    this.authService.setDevUser(role);
    this.menuOpen.set(false);
  }

  async logout(): Promise<void> {
    this.menuOpen.set(false);
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
