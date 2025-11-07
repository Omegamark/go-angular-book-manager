import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as UserActions from './user.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  form: FormGroup;
  userName: string;

  constructor(private fb: FormBuilder, private store: Store<AppState>) {
    this.form = this.fb.group({
      name: ['', Validators.required]
    })
    this.userName = ""
  }

  submit() {
    if (!this.form.valid) return;
    const { name } = this.form.value
    this.userName = name
    // dispatch action to update store
    this.store.dispatch(UserActions.SetUserName({ name }))
    this.form.reset()
  }
}
