import { Injectable, Renderer2, RendererFactory2, Signal, computed, effect, signal, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'themePreference';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly renderer: Renderer2;

  private readonly mediaQuery = '(prefers-color-scheme: dark)';
  private mediaQueryList: MediaQueryList | null = null;

  readonly preference = signal<ThemePreference>('system');
  readonly systemMode = signal<ThemeMode>('light');

  readonly mode: Signal<ThemeMode> = computed(() => {
    const preference = this.preference();
    if (preference === 'system') return this.systemMode();
    return preference;
  });

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    effect(() => {
      const mode = this.mode();
      this.applyMode(mode);
    });
  }

  init(): void {
    const stored = this.safeGetLocalStorage(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      this.preference.set(stored);
    }

    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return;
    }

    this.mediaQueryList = window.matchMedia(this.mediaQuery);
    const mql = this.mediaQueryList;
    this.systemMode.set(mql.matches ? 'dark' : 'light');

    const handler = (event: MediaQueryListEvent) => {
      this.systemMode.set(event.matches ? 'dark' : 'light');
    };

    if ('addEventListener' in mql) {
      mql.addEventListener('change', handler);
    } else {
      (mql as unknown as { addListener: (cb: (e: MediaQueryListEvent) => void) => void }).addListener(handler);
    }
  }

  toggle(): void {
    const next = this.mode() === 'dark' ? 'light' : 'dark';
    this.setPreference(next);
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);
    this.safeSetLocalStorage(STORAGE_KEY, preference);
  }

  private applyMode(mode: ThemeMode): void {
    const root = this.document?.documentElement;
    if (!root) return;

    this.renderer.setAttribute(root, 'data-theme', mode);
  }

  private safeGetLocalStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private safeSetLocalStorage(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // noop
    }
  }
}
