import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@shared/api/instance'

interface AnalyticsState {
  data: Record<string, any>
  loading: boolean
  error: string | null
}

const initialState: AnalyticsState = {
  data: {},
  loading: false,
  error: null,
}

export const fetchHabitAnalytics = createAsyncThunk(
  'analytics/fetchHabit',
  async ({ habitId, days = 30 }: { habitId: string; days?: number }) => {
    const response = await api.get(`/analytics/habits/${habitId}`, { params: days ? { days } : {} })
    return { habitId, data: response.data }
  }
)

export const fetchHeatmap = createAsyncThunk('analytics/fetchHeatmap', async (days = 365) => {
  const response = await api.get('/analytics/heatmap', { params: { days } })
  return response.data
})

export const fetchInsights = createAsyncThunk('analytics/fetchInsights', async () => {
  const response = await api.get('/analytics/insights')
  return response.data
})

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHabitAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHabitAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.data[action.payload.habitId] = action.payload.data
      })
      .addCase(fetchHabitAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch analytics'
      })
      .addCase(fetchHeatmap.fulfilled, (state, action) => {
        state.data.heatmap = action.payload
      })
      .addCase(fetchHeatmap.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch heatmap'
      })
      .addCase(fetchInsights.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.loading = false
        state.data.insights = action.payload
      })
      .addCase(fetchInsights.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch insights'
      })
  },
})

export default analyticsSlice.reducer
