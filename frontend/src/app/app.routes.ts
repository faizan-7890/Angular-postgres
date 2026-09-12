import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'assets',
    loadComponent: () =>
      import('./features/assets/assets.component').then((m) => m.AssetsComponent),
  },
  {
    path: 'kanban',
    loadComponent: () =>
      import('./features/kanban/kanban.component').then((m) => m.KanbanComponent),
  },
  {
    path: 'schedules',
    loadComponent: () =>
      import('./features/schedules/schedules.component').then((m) => m.SchedulesComponent),
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./features/inventory/inventory.component').then((m) => m.InventoryComponent),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
