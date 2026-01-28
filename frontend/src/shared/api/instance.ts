import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.baseURL || config.baseURL.startsWith('http')) {
      config.baseURL = '/api/v1'
    }
    if (config.url && config.url.startsWith('http')) {
      const url = new URL(config.url)
      config.url = url.pathname + url.search
    }
    const token = localStorage.getItem('access_token')
    if (token) {
      if (config.headers) {
        if (typeof (config.headers as { set?: unknown }).set === 'function') {
          (config.headers as { set: (key: string, value: string) => void }).set('Authorization', `Bearer ${token}`)
        } else {
          (config.headers as Record<string, unknown>).Authorization = `Bearer ${token}`
        }
      } else {
        config.headers = {
          Authorization: `Bearer ${token}`,
        } as InternalAxiosRequestConfig['headers']
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
