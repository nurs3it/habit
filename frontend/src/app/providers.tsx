import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store'
import { useEffect } from 'react'
import { setTheme } from '@shared/lib/uiSlice'
import { fetchCurrentUser } from '@entities/user/model/userSlice'

function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      store.dispatch(setTheme(savedTheme))
    }
    const theme = savedTheme || 'light'
    document.documentElement.classList.toggle('dark', theme === 'dark')

    const token = localStorage.getItem('access_token')
    if (token) {
      store.dispatch(fetchCurrentUser())
    }
  }, [])

  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>{children}</ThemeProvider>
      </BrowserRouter>
    </Provider>
  )
}
