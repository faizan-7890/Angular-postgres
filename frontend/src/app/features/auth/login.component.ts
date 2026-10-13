import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClerkAuthService } from '../../core/services/clerk-auth.service';
import { UserRole } from '../../core/models/auth.models';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <!-- Ambient Industrial Background Glows -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Main Login Container -->
      <div class="w-full max-w-md relative z-10">
        <!-- Brand Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/25 ring-2 ring-blue-400/30 mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            OpsTrack <span class="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">CMMS</span>
          </h1>
          <p class="text-sm text-slate-400 mt-1">Enterprise Maintenance Access Portal</p>
        </div>

        <!-- Clerk Component Container (When Clerk Key is Active) -->
        @if (!authService.isDevMode()) {
          <div class="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-2xl">
            <div #clerkSignInContainer id="clerk-sign-in" class="flex justify-center"></div>
          </div>
        } @else {
          <!-- Dev Mode & Role Selection Card -->
          <div class="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-6">
            <div class="flex items-center justify-between pb-4 border-b border-slate-700">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
                <span class="text-sm font-semibold text-white">Clerk RBAC Portal</span>
              </div>
              <span class="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                Testing Mode
              </span>
            </div>

            <!-- Quick Role Select Options -->
            <div class="space-y-3">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Demo Persona</p>

              <button
                (click)="loginAs('ADMIN')"
                class="w-full flex items-center justify-between p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-left transition-all group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    AD
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-white group-hover:text-purple-300">Administrator</p>
                    <p class="text-xs text-slate-400">Full system access, delete assets, manage users</p>
                  </div>
                </div>
                <span class="text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">Enter &rarr;</span>
              </button>

              <button
                (click)="loginAs('MANAGER')"
                class="w-full flex items-center justify-between p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-left transition-all group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    MG
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-white group-hover:text-blue-300">Maintenance Manager</p>
                    <p class="text-xs text-slate-400">Approve work orders, manage parts & schedules</p>
                  </div>
                </div>
                <span class="text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">Enter &rarr;</span>
              </button>

              <button
                (click)="loginAs('TECHNICIAN')"
                class="w-full flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition-all group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    TC
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-white group-hover:text-emerald-300">Field Technician</p>
                    <p class="text-xs text-slate-400">Assigned orders, log actual hours & spare parts</p>
                  </div>
                </div>
                <span class="text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">Enter &rarr;</span>
              </button>
            </div>

            <!-- Optional: Paste Clerk Publishable Key Section -->
            <div class="pt-4 border-t border-slate-700/80">
              <label class="block text-xs font-medium text-slate-400 mb-1.5">
                Connect Live Clerk Account (Optional)
              </label>
              <div class="flex gap-2">
                <input
                  type="text"
                  [(ngModel)]="clerkKeyInput"
                  placeholder="pk_test_..."
                  class="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  (click)="saveClerkKey()"
                  [disabled]="!clerkKeyInput"
                  class="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white transition-colors"
                >
                  Connect
                </button>
              </div>
              <p class="text-[11px] text-slate-500 mt-1.5">
                Obtain your key from <a href="https://dashboard.clerk.com" target="_blank" rel="noopener" class="text-blue-400 hover:underline">dashboard.clerk.com</a>.
              </p>
            </div>
          </div>
        }

        <!-- Footer -->
        <p class="text-center text-xs text-slate-500 mt-6">
          OpsTrack CMMS &bull; Protected by Industrial RBAC Security
        </p>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('clerkSignInContainer') clerkContainer?: ElementRef<HTMLDivElement>;

  authService = inject(ClerkAuthService);
  themeService = inject(ThemeService);
  router = inject(Router);

  clerkKeyInput: string = '';

  ngOnInit(): void {
    if (this.authService.isSignedIn() && !this.authService.isDevMode()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngAfterViewInit(): void {
    if (!this.authService.isDevMode() && this.clerkContainer?.nativeElement) {
      this.authService.mountSignIn(this.clerkContainer.nativeElement);
    }
  }

  loginAs(role: UserRole): void {
    this.authService.setDevUser(role);
    this.router.navigate(['/dashboard']);
  }

  saveClerkKey(): void {
    if (this.clerkKeyInput.trim().startsWith('pk_')) {
      this.authService.savePublishableKey(this.clerkKeyInput.trim());
      this.router.navigate(['/login']);
    }
  }
}
