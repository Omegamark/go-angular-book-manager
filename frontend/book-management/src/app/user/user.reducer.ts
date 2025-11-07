import { createReducer, on } from "@ngrx/store";
import * as UserActions from "./user.actions"

export interface UserState {
    name: string;
}

export const initialUserState: UserState = {
    name: ''
}

export const UserReducer = createReducer(
    initialUserState,
    on(UserActions.SetUserName, (state, {name}) => ({...state, name}))
)