import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../app.state';
import { selectUserName } from '../user/user.selectors';

@Component({
  selector: 'app-app-home',
  templateUrl: './app-home.component.html',
  styleUrls: ['./app-home.component.css']
})
export class AppHomeComponent {
  userName$: Observable<string>;
  constructor(private store: Store<AppState>) {
    this.userName$ = this.store.pipe(select(selectUserName))
  }
}
