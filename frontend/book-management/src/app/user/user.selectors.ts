import { createFeatureSelector, createSelector } from "@ngrx/store"
import { UserState } from "./user.reducer"

export const USER_FEATURE_KEY = 'user'
export const selectUserState = createFeatureSelector<UserState>(USER_FEATURE_KEY)
export const selectUserName = createSelector(selectUserState, (s: UserState) => s.name)