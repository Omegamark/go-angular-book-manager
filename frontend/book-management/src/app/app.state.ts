import { BookState } from "./books/book.reducer"
import { UserState } from "./user/user.reducer"

export interface AppState {
    readonly book: BookState
    readonly user: UserState
}
