import { useAppDispatch, useAppSelector } from '@shared/lib/hooks'
import { logout } from '@entities/user/model/userSlice'
import { setTheme } from '@shared/lib/uiSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Switch } from '@shared/ui/switch'
import { Moon, Sun, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function SettingsScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useAppSelector((state) => state.ui.theme)
  const user = useAppSelector((state) => state.user.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span>Dark mode</span>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => dispatch(setTheme(checked ? 'dark' : 'light'))}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent>
          {user && (
            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <span className="text-muted-foreground">Email: </span>
                {user.email}
              </p>
            </div>
          )}
          <Button variant="destructive" onClick={handleLogout} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
