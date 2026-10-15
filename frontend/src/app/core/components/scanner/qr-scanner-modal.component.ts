import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  inject,
  signal,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { ScannerService } from '../../services/scanner.service';

@Component({
  selector: 'app-qr-scanner-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (scannerService.isScannerOpen()) {
      <div
        (click)="close()"
        class="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      >
        <div
          (click)="$event.stopPropagation()"
          class="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 flex flex-col max-h-[92vh] overflow-hidden"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-white flex items-center gap-2">
                  Machinery QR & Barcode Scanner
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                    Live HUD
                  </span>
                </h3>
                <p class="text-xs text-slate-400">Scan equipment tags, serial numbers, or inspection badges</p>
              </div>
            </div>

            <button
              (click)="close()"
              class="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Scanner Mode Tabs -->
          <div class="flex items-center gap-2 pt-4 pb-3 flex-shrink-0">
            <button
              type="button"
              (click)="switchTab('camera')"
              [ngClass]="{
                'bg-blue-600 text-white font-semibold shadow-sm': activeTab() === 'camera',
                'bg-slate-800 text-slate-400 hover:text-white': activeTab() !== 'camera'
              }"
              class="flex-1 py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Live Camera
            </button>

            <button
              type="button"
              (click)="switchTab('file')"
              [ngClass]="{
                'bg-blue-600 text-white font-semibold shadow-sm': activeTab() === 'file',
                'bg-slate-800 text-slate-400 hover:text-white': activeTab() !== 'file'
              }"
              class="flex-1 py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Upload Photo
            </button>

            <button
              type="button"
              (click)="switchTab('manual')"
              [ngClass]="{
                'bg-blue-600 text-white font-semibold shadow-sm': activeTab() === 'manual',
                'bg-slate-800 text-slate-400 hover:text-white': activeTab() !== 'manual'
              }"
              class="flex-1 py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Manual Code
            </button>
          </div>

          <!-- TAB 1: Live Camera Viewport -->
          @if (activeTab() === 'camera') {
            <div class="relative flex-1 min-h-[300px] bg-black rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center">
              <!-- Video target container for Html5Qrcode -->
              <div id="interactive-reader" class="w-full h-full min-h-[280px]"></div>

              <!-- Animated Industrial Reticle HUD Overlay -->
              @if (isScanning()) {
                <div class="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <!-- Reticle Target Box -->
                  <div class="relative w-56 h-56 border-2 border-dashed border-blue-400/50 rounded-2xl flex items-center justify-center">
                    <!-- Corner Brackets -->
                    <div class="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-blue-400"></div>
                    <div class="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-blue-400"></div>
                    <div class="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-blue-400"></div>
                    <div class="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-blue-400"></div>

                    <!-- Glowing Laser Scan Line -->
                    <div class="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-bounce"></div>
                  </div>

                  <p class="text-[11px] font-mono text-blue-300/80 bg-slate-900/80 px-3 py-1 rounded-full mt-4 backdrop-blur-sm border border-blue-500/20">
                    Align QR badge within frame
                  </p>
                </div>
              }

              <!-- Camera Permissions / Loading Message -->
              @if (cameraError()) {
                <div class="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center">
                  <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                  </div>
                  <h4 class="text-sm font-bold text-white mb-1">Camera Inaccessible</h4>
                  <p class="text-xs text-slate-400 mb-4 max-w-xs">{{ cameraError() }}</p>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      (click)="startCameraScanner()"
                      class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      type="button"
                      (click)="switchTab('file')"
                      class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                    >
                      Upload File Instead
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Camera Switcher Control Bar -->
            @if (cameras().length > 1) {
              <div class="flex items-center justify-between pt-3 text-xs text-slate-400">
                <span>Camera Device:</span>
                <select
                  [ngModel]="selectedCameraId()"
                  (ngModelChange)="onCameraChange($event)"
                  class="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  @for (cam of cameras(); track cam.id) {
                    <option [value]="cam.id">{{ cam.label || 'Camera ' + ($index + 1) }}</option>
                  }
                </select>
              </div>
            }
          }

          <!-- TAB 2: Scan from Image File -->
          @if (activeTab() === 'file') {
            <div class="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/40 text-center">
              <div class="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mb-3">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
              </div>

              <h4 class="text-sm font-semibold text-white mb-1">Select Equipment Badge Image</h4>
              <p class="text-xs text-slate-400 mb-4 max-w-xs">
                Upload a photo or screenshot of any OpsTrack QR label or equipment serial tag.
              </p>

              <label class="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Choose Image File
                <input
                  type="file"
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  class="hidden"
                />
              </label>

              @if (fileProcessing()) {
                <p class="text-xs text-blue-400 mt-3 animate-pulse">Decoding QR code from image...</p>
              }
            </div>
          }

          <!-- TAB 3: Manual Serial / ID Lookup -->
          @if (activeTab() === 'manual') {
            <div class="flex-1 flex flex-col justify-center p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <label class="block text-xs font-semibold text-slate-300 mb-2">
                Asset Tag or Serial Number
              </label>

              <div class="flex gap-2">
                <input
                  type="text"
                  [(ngModel)]="manualCodeInput"
                  (keyup.enter)="submitManualCode()"
                  placeholder="e.g. SN-AIR-9021 or AST-PNE-001"
                  class="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  (click)="submitManualCode()"
                  [disabled]="!manualCodeInput.trim()"
                  class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white transition-colors"
                >
                  Lookup
                </button>
              </div>

              <p class="text-[11px] text-slate-500 mt-2">
                Tip: You can paste the raw UUID, the equipment serial number, or any URL from an OpsTrack badge.
              </p>
            </div>
          }

          <!-- Modal Footer -->
          <div class="flex items-center justify-between pt-4 border-t border-slate-800 mt-3 flex-shrink-0">
            <span class="text-[11px] text-slate-500 font-mono">OpsTrack QR Engine v2.4</span>
            <button
              type="button"
              (click)="close()"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class QrScannerModalComponent implements OnInit, OnDestroy, AfterViewInit {
  scannerService = inject(ScannerService);

  activeTab = signal<'camera' | 'file' | 'manual'>('camera');
  isScanning = signal<boolean>(false);
  cameraError = signal<string | null>(null);
  cameras = signal<Array<{ id: string; label: string }>>([]);
  selectedCameraId = signal<string>('');
  fileProcessing = signal<boolean>(false);
  manualCodeInput: string = '';

  private html5QrCode: Html5Qrcode | null = null;

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }

  ngOnInit() {
    // Component is created by parent
  }

  ngAfterViewInit() {
    // If opened directly in camera mode, initialize
    if (this.scannerService.isScannerOpen() && this.activeTab() === 'camera') {
      setTimeout(() => this.startCameraScanner(), 100);
    }
  }

  ngOnDestroy() {
    this.stopCameraScanner();
  }

  close() {
    this.stopCameraScanner();
    this.scannerService.closeScanner();
  }

  switchTab(tab: 'camera' | 'file' | 'manual') {
    this.activeTab.set(tab);
    if (tab === 'camera') {
      setTimeout(() => this.startCameraScanner(), 100);
    } else {
      this.stopCameraScanner();
    }
  }

  async startCameraScanner() {
    this.cameraError.set(null);

    try {
      if (!this.html5QrCode) {
        this.html5QrCode = new Html5Qrcode('interactive-reader', {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
          ],
          verbose: false,
        });
      }

      // Discover camera devices
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        this.cameraError.set('No camera found on this device.');
        return;
      }

      this.cameras.set(devices);
      // Prefer back camera if available (facingMode: environment)
      const backCam = devices.find((d) =>
        d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'),
      );
      const chosenId = backCam ? backCam.id : devices[0].id;
      this.selectedCameraId.set(chosenId);

      const config = {
        fps: 15,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0,
      };

      await this.html5QrCode.start(
        chosenId,
        config,
        (decodedText) => {
          this.onCodeDecoded(decodedText);
        },
        () => {
          // Frame scanned with no code found - ignore
        },
      );

      this.isScanning.set(true);
    } catch (err: any) {
      console.warn('Camera scanner start error:', err);
      this.isScanning.set(false);
      this.cameraError.set(
        err?.message ||
          'Camera access was denied or is in use by another app. Please grant permission or use photo upload.',
      );
    }
  }

  async stopCameraScanner() {
    if (this.html5QrCode && this.isScanning()) {
      try {
        await this.html5QrCode.stop();
        this.isScanning.set(false);
      } catch (err) {
        console.warn('Error stopping camera:', err);
      }
    }
  }

  async onCameraChange(cameraId: string) {
    this.selectedCameraId.set(cameraId);
    await this.stopCameraScanner();
    await this.startCameraScanner();
  }

  onCodeDecoded(text: string) {
    this.stopCameraScanner();
    this.scannerService.processScanResult(text);
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.fileProcessing.set(true);

    try {
      if (!this.html5QrCode) {
        this.html5QrCode = new Html5Qrcode('interactive-reader', {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
          ],
          verbose: false,
        });
      }

      const decodedText = await this.html5QrCode.scanFile(file, true);
      this.fileProcessing.set(false);
      this.onCodeDecoded(decodedText);
    } catch (err: any) {
      this.fileProcessing.set(false);
      alert('Could not detect a valid QR code in this image. Please try a clearer picture.');
    }
  }

  submitManualCode() {
    if (this.manualCodeInput.trim()) {
      this.scannerService.processScanResult(this.manualCodeInput.trim());
      this.manualCodeInput = '';
    }
  }
}
