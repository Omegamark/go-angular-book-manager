import { createAction, props } from "@ngrx/store";

export const SetUserName = createAction('[User] Set Name', props<{name: string}>())