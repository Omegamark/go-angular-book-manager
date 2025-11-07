import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Book } from '../models/book';
import { AddBook, RemoveBook, LoadBooks } from '../books/book.actions';
import { AppState } from '../app.state';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { selectUserName } from '../user/user.selectors';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})

export class BookListComponent implements OnInit {

  books$: Observable<Book[]>
  bookForm: FormGroup
  errorMessage: string | null = null

  userName$: Observable<string>

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>) {
    this.books$ = store.pipe(select((state: AppState) => state.book.books))
    this.bookForm = this.fb.group({
      id: ['', Validators.required],
      title: ['', Validators.required],
      author: ['', Validators.required],
    }),
    this.userName$ = store.pipe(select(selectUserName))
  }

  ngOnInit(): void {
    // Load the books from the database
    this.store.dispatch(LoadBooks())
  }

  onAddBook(): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched()
      this.bookForm.setErrors({ submitFailed: true })
      this.errorMessage = 'Please correct the highlighted fields before adding a book'
      return
    }

    // clear any previous error state
    this.bookForm.setErrors(null)
    this.errorMessage = null

    const { id, title, author } = this.bookForm.value
    this.store.dispatch(AddBook({ id, title, author }))
    this.bookForm.reset()
  }

  onRemoveBook(bookId: string) {
    this.store.dispatch(RemoveBook({ bookId }))
  }
}
