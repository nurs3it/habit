import { configureStore } from '@reduxjs/toolkit'
import userReducer from '@entities/user/model/userSlice'
import habitsReducer from '@entities/habit/model/habitsSlice'
import checkinsReducer from '@entities/checkin/model/checkinsSlice'
import analyticsReducer from '@entities/habit/model/analyticsSlice'
import uiReducer from '@shared/lib/uiSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    habits: habitsReducer,
    checkins: checkinsReducer,
    analytics: analyticsReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
