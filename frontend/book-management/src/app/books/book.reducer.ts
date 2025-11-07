import { createReducer, on } from "@ngrx/store";
// import { AddBook, AddBookFailure, AddBookSuccess, RemoveBook } from "./book.actions";
// Import all the actions into the reducer
import * as bookActions from "./book.actions"
import { Book } from "../models/book";

export interface BookState {
    books: Book[]
    // TODO: loading property is not actually being used right now. Could be used with an *ngIf directive to show a spinner or something in the HTML.
    loading: boolean;
    error?: any;
}

export const initialState: BookState = {
    books: [],
    loading: false,
}

export const BookReducer = createReducer(
    initialState,

    // load/list book flow
    on(bookActions.LoadBooks, (state) => ({ ...state, loading: true })),
    on(bookActions.LoadBooksSuccess, (state, { books }) => ({ ...state, loading: false, books })),
    on(bookActions.LoadBooksFailure, (state, { error }) => ({ ...state, loading: false, error })),

    // Add Book flow
    on(bookActions.AddBook, (state) => ({ ...state, loading: true })),
    on(bookActions.AddBookSuccess, (state, { book }) => ({
        ...state,
        loading: false,
        books: [...state.books, book],
    })),
    on(bookActions.AddBookFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Remove Book flow
    on(bookActions.RemoveBook, (state) => ({ ...state, loading: true })),
    on(bookActions.RemoveBookSuccess, (state, { bookId }) => ({
        ...state,
        loading: false,
        books: state.books.filter(b => b.id !== bookId),
    })),
    on(bookActions.RemoveBookFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    }))
)