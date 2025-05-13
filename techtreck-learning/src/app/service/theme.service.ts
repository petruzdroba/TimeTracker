import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private themeData = signal<'light' | 'dark'>('light');

  constructor() {
    if (typeof window !== 'undefined') {
      const storedThemeObject = window.localStorage.getItem('themeData');
      if (storedThemeObject) {
        this.themeData.set(JSON.parse(storedThemeObject));
        document.documentElement.setAttribute('data-theme', this.themeData());
      }
    }
  }

  get runningTheme(): 'light' | 'dark' {
    return this.themeData();
  }

  toggleTheme() {
    this.themeData.set(this.themeData() === 'light' ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', this.themeData());
    this.updateTheme();
  }

  updateTheme() {
    window.localStorage.setItem('themeData', JSON.stringify(this.themeData()));
  }
}
