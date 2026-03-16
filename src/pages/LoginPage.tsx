import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthShowcasePanel } from '@/components/layout/AuthShowcasePanel'
import { loginSchema } from '@/lib/validators'
import { APP_NAME } from '@/lib/constants'

export function LoginPage() {
  const { user, loading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setSubmitting(true)
    const { error: signInError } = await signIn(email, password)
    if (signInError) setError(signInError)
    setSubmitting(false)
  }

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.12),transparent_24%),var(--background)] p-4 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100dvh-2rem)] max-w-7xl items-center gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="w-full animate-fade-in">
          <div className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur md:p-8">
            <div className="mb-8">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                SI
              </div>
              <h1 className="[font-family:'Sora',sans-serif] text-3xl font-semibold">{APP_NAME}</h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Entre para acessar sua operacao com IA e o novo modulo Conexao Gospel com UX mais forte para relacionamento e networking.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seu@email.com"
                    className="flex h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">Senha</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Sua senha"
                      className="flex h-12 w-full rounded-2xl border border-input bg-background px-4 pr-11 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Entrar
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center text-sm text-muted-foreground">
                Nao tem conta?{' '}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Criar conta
                </Link>
              </div>
            </div>
          </div>
        </div>

        <AuthShowcasePanel />
      </div>
    </div>
  )
}
