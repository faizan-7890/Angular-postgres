import { Component, input, output, OnInit, signal, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as QRCode from 'qrcode';
import { Asset } from '../../core/models/opstrack.models';

@Component({
  selector: 'app-asset-qr-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal Backdrop -->
    <div
      (click)="close.emit()"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static"
    >
      <div
        (click)="$event.stopPropagation()"
        class="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 print:bg-white print:border-none print:shadow-none print:p-0 print:static print:w-full print:max-w-none"
      >
        <!-- Modal Header (Hidden on Print) -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-base font-bold text-white">Physical Equipment Tag</h2>
              <p class="text-xs text-slate-400">Scannable QR badge for plant machinery & bins</p>
            </div>
          </div>
          <button
            (click)="close.emit()"
            class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Preview Card -->
        <div class="py-6 print:py-0 flex flex-col items-center justify-center">
          <!-- Physical Badge Preview Container -->
          <div
            id="printable-badge-area"
            class="w-full max-w-[340px] bg-white text-black p-4 rounded-xl border-2 border-slate-900 shadow-xl flex flex-col items-center text-center font-mono print:border-2 print:border-black print:shadow-none"
          >
            <!-- Header Bar -->
            <div class="w-full border-b-2 border-black pb-2 mb-2 flex items-center justify-between text-left">
              <div>
                <span class="text-[12px] font-black tracking-tighter uppercase block">OPSTRACK CMMS</span>
                <span class="text-[9px] text-zinc-600 block">ASSET IDENTIFICATION TAG</span>
              </div>
              <span class="text-[10px] font-bold px-1.5 py-0.5 border border-black rounded uppercase">
                {{ asset().category }}
              </span>
            </div>

            <!-- Asset Title & SN -->
            <div class="w-full text-left my-1">
              <h4 class="text-sm font-black text-black leading-tight truncate uppercase">{{ asset().name }}</h4>
              <p class="text-[11px] font-bold text-zinc-800 tracking-wide mt-0.5">SN: {{ asset().serial_number }}</p>
              <p class="text-[10px] text-zinc-600 truncate mt-0.5">LOC: {{ asset().location }}</p>
            </div>

            <!-- QR Code Graphic -->
            <div class="my-2 p-1.5 bg-white border-2 border-black rounded-lg flex items-center justify-center">
              @if (qrDataUrl()) {
                <img [src]="qrDataUrl()" alt="QR Code" class="w-40 h-40 block object-contain" />
              } @else {
                <div class="w-40 h-40 flex items-center justify-center text-xs text-zinc-400">
                  Generating QR...
                </div>
              }
            </div>

            <!-- Badge Footer -->
            <div class="w-full border-t-2 border-black pt-1.5 mt-1 flex items-center justify-between text-[9px] text-zinc-700">
              <span class="truncate">ID: {{ asset().id.substring(0, 13) }}...</span>
              <span class="font-bold uppercase text-black">{{ asset().status }}</span>
            </div>
          </div>
        </div>

        <!-- Print & Modal Actions (Hidden on Print) -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-800 print:hidden">
          <button
            type="button"
            (click)="downloadPng()"
            [disabled]="!qrDataUrl()"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Save PNG
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="close.emit()"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="printBadge()"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Print Label Tag
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AssetQrModalComponent implements OnInit {
  asset = input.required<Asset>();
  close = output<void>();

  qrDataUrl = signal<string>('');

  constructor() {
    effect(() => {
      const a = this.asset();
      if (a) {
        this.generateQr();
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscapePress() {
    this.close.emit();
  }

  ngOnInit() {
    this.generateQr();
  }

  async generateQr() {
    const a = this.asset();
    if (!a) return;

    // Structured JSON payload containing equipment ID, serial number, and direct link
    const payload = JSON.stringify({
      id: a.id,
      sn: a.serial_number,
      name: a.name,
      url: `http://localhost:3000/api/assets/${a.id}`,
    });

    try {
      const url = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      this.qrDataUrl.set(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  }

  downloadPng() {
    if (!this.qrDataUrl()) return;
    const a = document.createElement('a');
    a.href = this.qrDataUrl();
    a.download = `QR-${this.asset().serial_number || 'asset'}.png`;
    a.click();
  }

  printBadge() {
    window.print();
  }
}
