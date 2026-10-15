import { Component, signal, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { SidebarComponent } from './core/components/layout/sidebar.component';
import { HeaderComponent } from './core/components/layout/header.component';
import { ToastComponent } from './core/components/toast/toast.component';
import { ThemeService } from './core/services/theme.service';
import { ToastService } from './core/services/toast.service';
import { QrScannerModalComponent } from './core/components/scanner/qr-scanner-modal.component';
import { ScannedAssetModalComponent } from './core/components/scanner/scanned-asset-modal.component';
import { AssetDetailModalComponent } from './features/assets/asset-detail-modal.component';
import { AssetQrModalComponent } from './features/assets/asset-qr-modal.component';
import { WorkOrderModalComponent } from './features/kanban/work-order-modal.component';
import { Asset } from './core/models/opstrack.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    ToastComponent,
    QrScannerModalComponent,
    ScannedAssetModalComponent,
    AssetDetailModalComponent,
    AssetQrModalComponent,
    WorkOrderModalComponent,
  ],
  template: `
    @if (isAuthRoute()) {
      <!-- Fullscreen Auth View (Login / Clerk Component) -->
      <router-outlet></router-outlet>
    } @else {
      <!-- Standard Main Layout -->
      <div class="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
        <app-sidebar [isOpen]="sidebarOpen()" (closeSidebar)="sidebarOpen.set(false)" />

        <div class="flex-1 flex flex-col min-w-0 lg:pl-64">
          <app-header (toggleSidebar)="toggleSidebar()" />

          <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    }

    <!-- Global Machinery QR & Barcode Camera Scanner Modal -->
    <app-qr-scanner-modal />

    <!-- Scanned Equipment Quick Actions Modal -->
    <app-scanned-asset-modal
      (openWorkOrder)="onOpenWorkOrder($event)"
      (openDetails)="onOpenDetails($event)"
      (openPrintBadge)="onOpenPrintBadge($event)"
    />

    <!-- Global Asset Details Modal -->
    @if (selectedDetailAssetId()) {
      <app-asset-detail-modal
        [assetId]="selectedDetailAssetId()!"
        (close)="selectedDetailAssetId.set(null)"
      />
    }

    <!-- Global Asset QR Printable Badge Modal -->
    @if (selectedQrAsset(); as asset) {
      <app-asset-qr-modal
        [asset]="asset"
        (close)="selectedQrAsset.set(null)"
      />
    }

    <!-- Quick Work Order Creation Modal (Triggered by QR Scanner) -->
    @if (quickWorkOrderAsset(); as asset) {
      <app-work-order-modal
        [preselectedAssetId]="asset.id"
        [preselectedTitle]="'Emergency Breakdown: ' + asset.name"
        (close)="quickWorkOrderAsset.set(null)"
        (created)="onWorkOrderCreated()"
      />
    }

    <app-toast />
  `,
})
export class AppComponent {
  sidebarOpen = signal<boolean>(false);
  isAuthRoute = signal<boolean>(false);

  // Global scanner modals state
  selectedDetailAssetId = signal<string | null>(null);
  selectedQrAsset = signal<Asset | null>(null);
  quickWorkOrderAsset = signal<Asset | null>(null);

  themeService = inject(ThemeService);
  private toast = inject(ToastService);
  private router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isAuthRoute.set(event.urlAfterRedirects.includes('/login'));
      });
  }

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  onOpenDetails(asset: Asset) {
    this.selectedDetailAssetId.set(asset.id);
  }

  onOpenPrintBadge(asset: Asset) {
    this.selectedQrAsset.set(asset);
  }

  onOpenWorkOrder(asset: Asset) {
    this.quickWorkOrderAsset.set(asset);
  }

  onWorkOrderCreated() {
    this.quickWorkOrderAsset.set(null);
    this.toast.showSuccess('Work order dispatched successfully for scanned asset!', 'Order Created');
  }
}
