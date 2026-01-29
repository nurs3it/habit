import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@shared/lib/hooks'
import { register } from '@entities/user/model/userSlice'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { AuthLayout } from './AuthLayout'
import { LoginHero } from './AuthHeroes'
import { cn } from '@shared/lib/utils'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.user)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return
    }
    try {
      await dispatch(register({ email, password })).unwrap()
      navigate('/')
    } catch (err) {
      console.error('Registration failed:', err)
    }
  }

  const passwordsMismatch =
    Boolean(password && confirmPassword) && password !== confirmPassword

  const fadeStyle = (delay: string) => ({
    animationDelay: delay,
    opacity: 0,
    animationFillMode: 'forwards' as const,
  })

  return (
    <AuthLayout
      title="Create account"
      description="Start your journey today. Build habits that stick, one step at a time."
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
        {passwordsMismatch && (
          <div
            className="flex-shrink-0 mb-4 px-4 py-3 rounded-[10px] bg-destructive/10 text-destructive text-[15px] animate-auth-fade-in-up"
            style={fadeStyle('0.25s')}
            role="alert"
          >
            Passwords do not match
          </div>
        )}
        <div className="flex-shrink-0 space-y-4">
          <div
            className="space-y-2 animate-auth-fade-in-up"
            style={fadeStyle('0.3s')}
          >
            <label
              htmlFor="register-email"
              className="text-[15px] font-medium text-foreground"
            >
              Email
            </label>
            <Input
              id="register-email"
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
              htmlFor="register-password"
              className="text-[15px] font-medium text-foreground"
            >
              Password
            </label>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div
            className="space-y-2 animate-auth-fade-in-up"
            style={fadeStyle('0.5s')}
          >
            <label
              htmlFor="register-confirm"
              className="text-[15px] font-medium text-foreground"
            >
              Confirm password
            </label>
            <Input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex-1 min-h-[1.5rem]" />
        <div
          className="flex-shrink-0 space-y-4 pt-2 animate-auth-fade-in-up"
          style={fadeStyle('0.6s')}
        >
          <Button
            type="submit"
            size="lg"
            className="w-full font-semibold"
            disabled={loading || passwordsMismatch}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
          <p className="text-center text-[15px] text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-primary font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}
