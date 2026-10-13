import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'assets',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/assets/assets.component').then((m) => m.AssetsComponent),
  },
  {
    path: 'kanban',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/kanban/kanban.component').then((m) => m.KanbanComponent),
  },
  {
    path: 'schedules',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/schedules/schedules.component').then((m) => m.SchedulesComponent),
  },
  {
    path: 'inventory',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/inventory/inventory.component').then((m) => m.InventoryComponent),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
