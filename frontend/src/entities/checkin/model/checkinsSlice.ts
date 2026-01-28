import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@shared/api/instance'

export interface Checkin {
  id: string
  user_id: string
  habit_id: string
  date: string
  completed: boolean
  value?: number
  skipped: boolean
  created_at: string
}

interface CheckinsState {
  checkins: Checkin[]
  todayCheckins: Checkin[]
  loading: boolean
  error: string | null
}

const initialState: CheckinsState = {
  checkins: [],
  todayCheckins: [],
  loading: false,
  error: null,
}

export const fetchCheckins = createAsyncThunk(
  'checkins/fetchAll',
  async (params?: { habit_id?: string; start_date?: string; end_date?: string }) => {
    const response = await api.get('/checkins/', { params })
    return response.data
  }
)

export const fetchTodayCheckins = createAsyncThunk('checkins/fetchToday', async () => {
  const response = await api.get('/checkins/today')
  return response.data
})

export const createCheckin = createAsyncThunk(
  'checkins/create',
  async (data: { habit_id: string; date: string; completed: boolean; value?: number; skipped?: boolean }) => {
    const response = await api.post('/checkins/', data)
    return response.data
  }
)

export const deleteCheckin = createAsyncThunk('checkins/delete', async (id: string) => {
  await api.delete(`/checkins/${id}`)
  return id
})

const checkinsSlice = createSlice({
  name: 'checkins',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCheckins.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCheckins.fulfilled, (state, action) => {
        state.loading = false
        state.checkins = action.payload
      })
      .addCase(fetchCheckins.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch checkins'
      })
      .addCase(fetchTodayCheckins.fulfilled, (state, action) => {
        state.todayCheckins = action.payload
      })
      .addCase(createCheckin.fulfilled, (state, action) => {
        const today = new Date().toISOString().split('T')[0]
        if (action.payload.date === today) {
          const existing = state.todayCheckins.findIndex((c) => c.id === action.payload.id)
          if (existing !== -1) {
            state.todayCheckins[existing] = action.payload
          } else {
            state.todayCheckins.push(action.payload)
          }
        }
        const existing = state.checkins.findIndex((c) => c.id === action.payload.id)
        if (existing !== -1) {
          state.checkins[existing] = action.payload
        } else {
          state.checkins.push(action.payload)
        }
      })
      .addCase(deleteCheckin.fulfilled, (state, action) => {
        state.checkins = state.checkins.filter((c) => c.id !== action.payload)
        state.todayCheckins = state.todayCheckins.filter((c) => c.id !== action.payload)
      })
  },
})

export default checkinsSlice.reducer
