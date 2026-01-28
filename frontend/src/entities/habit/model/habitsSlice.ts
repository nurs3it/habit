import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '@shared/api/instance'

export interface Habit {
  id: string
  user_id: string
  name: string
  type: string
  frequency: string
  schedule?: Record<string, unknown> | null
  time_of_day?: string
  start_date: string
  goal?: number | null
  color: string
  icon?: string
  category?: string
  order: number
  archived: boolean
  created_at: string
  current_streak?: number
}

interface HabitsState {
  habits: Habit[]
  loading: boolean
  error: string | null
}

const initialState: HabitsState = {
  habits: [],
  loading: false,
  error: null,
}

export const fetchHabits = createAsyncThunk(
  'habits/fetchAll',
  async ({ archived, as_of_date }: { archived?: boolean; as_of_date?: string } = {}) => {
    const params: Record<string, string | boolean> = {}
    if (archived !== undefined) {
      params.archived = archived
    }
    if (as_of_date) {
      params.as_of_date = as_of_date
    }
    const response = await api.get('/habits/', { params })
    return response.data
  }
)

export const createHabit = createAsyncThunk('habits/create', async (habitData: Partial<Habit>) => {
  const response = await api.post('/habits/', habitData)
  return response.data
})

export const updateHabit = createAsyncThunk(
  'habits/update',
  async ({ id, data }: { id: string; data: Partial<Habit> }) => {
    const response = await api.put(`/habits/${id}`, data)
    return response.data
  }
)

export const deleteHabit = createAsyncThunk('habits/delete/', async (id: string) => {
  await api.delete(`/habits/${id}/`)
  return id
})

export const archiveHabit = createAsyncThunk('habits/archive/', async (id: string) => {
  await api.post(`/habits/${id}/archive/`)
  return id
})

const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    updateHabitOrder: (state, action: PayloadAction<{ id: string; order: number }>) => {
      const habit = state.habits.find((h) => h.id === action.payload.id)
      if (habit) {
        habit.order = action.payload.order
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHabits.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.loading = false
        state.habits = action.payload
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch habits'
      })
      .addCase(createHabit.fulfilled, (state, action) => {
        state.habits.push(action.payload)
      })
      .addCase(updateHabit.fulfilled, (state, action) => {
        const index = state.habits.findIndex((h) => h.id === action.payload.id)
        if (index !== -1) {
          state.habits[index] = action.payload
        }
      })
      .addCase(deleteHabit.fulfilled, (state, action) => {
        state.habits = state.habits.filter((h) => h.id !== action.payload)
      })
      .addCase(archiveHabit.fulfilled, (state, action) => {
        const habit = state.habits.find((h) => h.id === action.payload)
        if (habit) {
          habit.archived = true
        }
      })
  },
})

export const { updateHabitOrder } = habitsSlice.actions
export default habitsSlice.reducer
