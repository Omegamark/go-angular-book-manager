import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as bookActions from './book.actions'
import { BookService } from "./book.service";
import { catchError, map, mergeMap, of } from "rxjs";
import { Book } from "../models/book";

@Injectable()
export class BookEffects {

    loadBooks$ = createEffect(() =>
        this.actions$.pipe(
            ofType(bookActions.LoadBooks),
            mergeMap(() =>
                this.bookService.getBooks().pipe(
                    map((books: Book[]) => bookActions.LoadBooksSuccess({ books })),
                    catchError(error => of(bookActions.LoadBooksFailure({ error })))
                )
            )
        )
    )

    addBook$ = createEffect(() => this.actions$.pipe(
        ofType(bookActions.AddBook),
        mergeMap(({ id, title, author }: { id: string; title: string; author: string }) => {
            const book: Book = { id, title, author }
            return this.bookService.addBook(book).pipe(
                map((saved: Book) => bookActions.AddBookSuccess({ book: saved })),
                catchError((error) => of(bookActions.AddBookFailure({ error }))))
        })
    ))

    // TODO: Need to finish the actions for remove book success.
    removeBook$ = createEffect(() => this.actions$.pipe(
        ofType(bookActions.RemoveBook),
        mergeMap(({ bookId }: { bookId: string }) =>
            this.bookService.removeBook(bookId).pipe(
                map(() => bookActions.RemoveBookSuccess({ bookId })), // use the same ID here
                catchError((error) => of(bookActions.RemoveBookFailure({ error })))
            ))
    ))

    constructor(
        private actions$: Actions,
        private bookService: BookService
    ) { }
}