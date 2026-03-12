import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { registerSchema } from '@/lib/validators'
import { APP_NAME } from '@/lib/constants'

export function RegisterPage() {
  const { user, loading, signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = registerSchema.safeParse({ fullName, email, password, confirmPassword })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setSubmitting(true)
    const { error: signUpError } = await signUp(email, password, fullName, phone)
    if (signUpError) {
      setError(signUpError)
    } else {
      setSuccess(true)
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success text-success-foreground text-2xl">
            ✓
          </div>
          <h2 className="text-xl font-bold mb-2">Conta criada!</h2>
          <p className="text-muted-foreground mb-4">Verifique seu email para confirmar o cadastro.</p>
          <Link
            to="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-primary-foreground font-medium hover:opacity-90"
          >
            Ir para Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg">
            SI
          </div>
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Crie sua conta gratuita</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="fullName">Nome completo</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="regEmail">Email</label>
              <input
                id="regEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="regPhone">WhatsApp / Telefone</label>
              <input
                id="regPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
              <p className="text-xs text-muted-foreground">Para receber notificações por WhatsApp</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="regPassword">Senha</label>
              <div className="relative">
                <input
                  id="regPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="confirmPassword">Confirmar senha</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Criar conta
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
