import { createFeatureSelector, createSelector } from "@ngrx/store";
import { BookState } from "./book.reducer";

export const BOOK_FEATURE_KEY = 'book';
export const selectBookState = createFeatureSelector<BookState>(BOOK_FEATURE_KEY)
export const selectBooksLoading = createSelector(selectBookState, s => s.loading)