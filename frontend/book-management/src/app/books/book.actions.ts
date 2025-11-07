import { createAction, props } from "@ngrx/store";
import { Book } from "../models/book";

// load list
export const LoadBooks = createAction('[Book] Load Books');
export const LoadBooksSuccess = createAction('[Book] Load Books Success', props<{ books: Book[] }>())
export const LoadBooksFailure = createAction('[Book] Load Books Failure', props<{ error: any }>())

// add book (UI -> action -> effect(maps to AddBookSuccess & AddBookFailure) -> backend -> effect(AddBookSuccess || AddBookFailure) -> reducer -> state update -> ui update)
export const AddBook = createAction('[Book] Add Book', props<Book>())
// TODO: This should make an update to the UI
export const AddBookSuccess = createAction('[Book] Add Book Successfully', props<{ book: Book }>())
export const AddBookFailure = createAction('[Book] Add Book Failure', props<{ error: any }>())

// remove book (UI -> action -> effect(mergeMaps to AddBookSuccess & AddBookFailure) -> backend -> effect(AddbookSuccess or AddBookFailure) -> reducer -> state update -> ui update)
export const RemoveBook = createAction('[Book] Remove Book', props<{ bookId: string }>())
export const RemoveBookSuccess = createAction('[Book] Remove Book Successfully', props<{ bookId: string }>())
export const RemoveBookFailure = createAction('[Book] Remove Book Failure', props<{ error: any }>())
