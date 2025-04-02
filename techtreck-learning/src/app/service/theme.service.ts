import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: 'light' | 'dark' = 'light';

  constructor() {
    if (typeof window !== 'undefined') {
      const storedThemeObject = window.localStorage.getItem('themeData');
      if (storedThemeObject) {
        this.currentTheme = JSON.parse(storedThemeObject);
        document.documentElement.setAttribute('data-theme', this.currentTheme);
      }
    }
  }

  get runningTheme() {
    return this.currentTheme;
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.updateTheme();
  }

  updateTheme() {
    window.localStorage.setItem('themeData', JSON.stringify(this.currentTheme));
  }
}
