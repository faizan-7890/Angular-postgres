import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';
import { Asset } from '../models/opstrack.models';

@Injectable({
  providedIn: 'root',
})
export class ScannerService {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  readonly isScannerOpen = signal<boolean>(false);
  readonly isLookupLoading = signal<boolean>(false);
  readonly scannedAsset = signal<Asset | null>(null);
  readonly showQuickActions = signal<boolean>(false);
  readonly lastRawCode = signal<string | null>(null);

  // Audio Context for instant industrial scan confirmation beep
  private audioCtx: AudioContext | null = null;

  openScanner(): void {
    this.isScannerOpen.set(true);
  }

  closeScanner(): void {
    this.isScannerOpen.set(false);
  }

  closeQuickActions(): void {
    this.showQuickActions.set(false);
  }

  /**
   * Plays a crisp industrial barcode confirmation beep
   */
  playScanBeep(): void {
    try {
      if (!this.audioCtx) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      if (this.audioCtx) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        // Double-beep sequence: 1046Hz (C6) -> 2093Hz (C7)
        osc.frequency.setValueAtTime(1046, this.audioCtx.currentTime);
        osc.frequency.setValueAtTime(2093, this.audioCtx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.12);
      }
    } catch {
      // Audio playback fails gracefully if browser autoplay policy blocks it
    }
  }

  /**
   * Processes a raw string scanned from camera, file, or manual entry
   */
  processScanResult(rawText: string): void {
    if (!rawText || !rawText.trim()) return;

    this.playScanBeep();
    this.closeScanner();

    const clean = rawText.trim();
    this.lastRawCode.set(clean);
    this.isLookupLoading.set(true);

    let identifier = clean;

    // 1. Try parsing JSON format (which OpsTrack QR generator produces)
    if (clean.startsWith('{') && clean.endsWith('}')) {
      try {
        const parsed = JSON.parse(clean);
        identifier = parsed.id || parsed.sn || parsed.serial_number || clean;
      } catch {
        identifier = clean;
      }
    }
    // 2. Try parsing URL format (e.g. http://.../assets/:id)
    else if (clean.includes('/assets/')) {
      const parts = clean.split('/assets/');
      if (parts[1]) {
        identifier = parts[1].split('/')[0].split('?')[0].trim();
      }
    }

    // 3. Fetch equipment record from API
    this.api.getAssetById(identifier).subscribe({
      next: (asset) => {
        this.scannedAsset.set(asset);
        this.isLookupLoading.set(false);
        this.showQuickActions.set(true);
        this.toast.showSuccess(`Identified: ${asset.name} (${asset.serial_number})`, 'Equipment Scanned');
      },
      error: (err) => {
        this.isLookupLoading.set(false);
        this.toast.showError(
          `No machinery found matching tag "${identifier}". Check the code and try again.`,
          'Scan Lookup Failed',
        );
      },
    });
  }
}
