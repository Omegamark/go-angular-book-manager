import { Component } from '@angular/core';
import { ThemeService, Theme } from '../core/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.css']
})
export class ThemeToggleComponent {
  theme$: Observable<Theme> = this.themeService.theme$
  constructor(private themeService: ThemeService) { }
  toggle() { this.themeService.toggle(); }
}
