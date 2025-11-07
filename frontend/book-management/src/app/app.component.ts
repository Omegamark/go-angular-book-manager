import { Component } from '@angular/core';
import { Theme, ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // TODO: I don't understand what template is doing here.
  template: `<router-outlet></router-outlet><app-theme-toggle></app-theme-toggle>`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'book-management';
  constructor(private themeService: ThemeService) {}
  ngOnInit(): void { this.themeService.init()}
}
