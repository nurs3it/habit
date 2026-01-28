import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@shared/api/instance'

interface UserState {
  token: string | null
  user: {
    id: string
    email: string
    settings: {
      theme: string
      notifications_enabled: boolean
    }
  } | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  token: localStorage.getItem('access_token'),
  user: null,
  loading: false,
  error: null,
}

export const login = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials)
    localStorage.setItem('access_token', response.data.access_token)
    return response.data
  }
)

export const register = createAsyncThunk(
  'user/register',
  async (data: { email: string; password: string }) => {
    await api.post('/auth/register', data)
    const response = await api.post('/auth/login', { email: data.email, password: data.password })
    localStorage.setItem('access_token', response.data.access_token)
    return response.data
  }
)

export const fetchCurrentUser = createAsyncThunk('user/fetchCurrent', async () => {
  const response = await api.get('/auth/me')
  return response.data
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null
      state.user = null
      localStorage.removeItem('access_token')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.access_token
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Login failed'
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.access_token
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Registration failed'
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { logout, clearError } = userSlice.actions
export default userSlice.reducer
