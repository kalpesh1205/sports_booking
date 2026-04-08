import { Injectable } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'themeMode';
  private readonly lightClass = 'light-theme';

  initTheme(): void {
    const saved = localStorage.getItem(this.storageKey) as ThemeMode | null;
    const mode = saved ?? 'dark';
    this.applyTheme(mode);
  }

  getTheme(): ThemeMode {
    return document.body.classList.contains(this.lightClass) ? 'light' : 'dark';
  }

  toggleTheme(): ThemeMode {
    const nextMode: ThemeMode = this.getTheme() === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextMode);
    return nextMode;
  }

  private applyTheme(mode: ThemeMode): void {
    const useLight = mode === 'light';
    document.body.classList.toggle(this.lightClass, useLight);
    localStorage.setItem(this.storageKey, mode);
  }
}
