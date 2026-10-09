import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './core/components/layout/sidebar.component';
import { HeaderComponent } from './core/components/layout/header.component';
import { ToastComponent } from './core/components/toast/toast.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastComponent],
  template: `
    <div class="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
      <app-sidebar [isOpen]="sidebarOpen()" (closeSidebar)="sidebarOpen.set(false)" />

      <div class="flex-1 flex flex-col min-w-0 lg:pl-64">
        <app-header (toggleSidebar)="toggleSidebar()" />

        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <router-outlet></router-outlet>
        </main>
      </div>

      <app-toast />
    </div>
  `,
})
export class AppComponent {
  sidebarOpen = signal<boolean>(false);
  // Inject theme service to ensure theme is applied on app boot
  themeService = inject(ThemeService);

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }
}
