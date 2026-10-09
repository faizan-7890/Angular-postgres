import { Injectable, signal, computed, effect } from '@angular/core';

export type ThemeMode = 'dark' | 'light' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'opstrack_theme_preference';

  theme = signal<ThemeMode>(this.getInitialTheme());
  private systemPrefersDark = signal<boolean>(this.getSystemDarkPreference());

  effectiveTheme = computed<'dark' | 'light'>(() => {
    const current = this.theme();
    if (current === 'system') {
      return this.systemPrefersDark() ? 'dark' : 'light';
    }
    return current;
  });

  isDark = computed(() => this.effectiveTheme() === 'dark');

  constructor() {
    // Listen to system color scheme changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        this.systemPrefersDark.set(e.matches);
      });
    }

    // Effect to apply/remove .dark class on <html> root element
    effect(() => {
      const active = this.effectiveTheme();
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (active === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    });
  }

  setTheme(mode: ThemeMode) {
    this.theme.set(mode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, mode);
    }
  }

  toggleTheme() {
    const current = this.effectiveTheme();
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  private getInitialTheme(): ThemeMode {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode;
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        return saved;
      }
    }
    return 'dark'; // OpsTrack default dark theme
  }

  private getSystemDarkPreference(): boolean {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  }
}
