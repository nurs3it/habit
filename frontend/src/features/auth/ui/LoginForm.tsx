import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@shared/lib/hooks'
import { login } from '@entities/user/model/userSlice'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { AuthLayout } from './AuthLayout'
import { LoginHero } from './AuthHeroes'
import { cn } from '@shared/lib/utils'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.user)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(login({ email, password })).unwrap()
      navigate('/')
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  const fadeStyle = (delay: string) => ({
    animationDelay: delay,
    opacity: 0,
    animationFillMode: 'forwards' as const,
  })

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to pick up where you left off. Your habits are waiting."
      hero={<LoginHero />}
    >
      <form
        onSubmit={handleSubmit}
        className={cn(
          'flex flex-col flex-1 min-h-0',
          'pb-[max(env(safe-area-inset-bottom),2rem)]'
        )}
      >
        {error && (
          <div
            className="flex-shrink-0 mb-4 px-4 py-3 rounded-[10px] bg-destructive/10 text-destructive text-[15px] animate-auth-fade-in-up"
            style={fadeStyle('0.25s')}
            role="alert"
          >
            {error}
          </div>
        )}
        <div className="flex-shrink-0 space-y-4">
          <div
            className="space-y-2 animate-auth-fade-in-up"
            style={fadeStyle('0.3s')}
          >
            <label
              htmlFor="login-email"
              className="text-[15px] font-medium text-foreground"
            >
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div
            className="space-y-2 animate-auth-fade-in-up"
            style={fadeStyle('0.4s')}
          >
            <label
              htmlFor="login-password"
              className="text-[15px] font-medium text-foreground"
            >
              Password
            </label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex-1 min-h-[1.5rem]" />
        <div
          className="flex-shrink-0 space-y-4 pt-2 animate-auth-fade-in-up"
          style={fadeStyle('0.5s')}
        >
          <Button type="submit" size="lg" className="w-full font-semibold" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
          <p className="text-center text-[15px] text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-primary font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}
