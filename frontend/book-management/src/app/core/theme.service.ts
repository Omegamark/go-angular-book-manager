import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
// Adding this was a mistake.
export class ThemeService {
private readonly STORAGE_KEY = 'app.theme';
private themeSubject = new BehaviorSubject<Theme>(this.readInitial())
readonly theme$ = this.themeSubject.asObservable();

private readInitial(): Theme {
  const stored = localStorage.getItem(this.STORAGE_KEY)
  return stored === 'dark' ? 'dark' : 'light';
}

init(): void {
  this.applyClass(this.themeSubject.value)
}

setTheme(theme: Theme): void {
  this.themeSubject.next(theme)
  localStorage.setItem(this.STORAGE_KEY, theme)
  this.applyClass(theme)
}

toggle(): void {
  const next: Theme = this.themeSubject.value === 'dark' ? 'light' : 'dark'
  this.setTheme(next)
}

private applyClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark-mode');
  else root.classList.remove('dark-mode')
}


  constructor() { }
}
