import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useAdmin } from '@/hooks/useAdmin'
import { UserPlus, Shield, ShieldOff, UserX, UserCheck, X, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

export function AdminPage() {
  const { profile } = useAuth()
  const { users, isLoading, createUser, toggleUserActive, updateUserRole } = useAdmin()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  if (profile && profile.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const handleToggleActive = async (id: string, is_active: boolean) => {
    try {
      await toggleUserActive.mutateAsync({ id, is_active })
      toast.success(is_active ? 'Usuário desativado' : 'Usuário ativado')
    } catch {
      toast.error('Erro ao atualizar usuário')
    }
  }

  const handleToggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    try {
      await updateUserRole.mutateAsync({ id, role: newRole })
      toast.success(`Usuário agora é ${newRole}`)
    } catch {
      toast.error('Erro ao atualizar função')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Administração</h2>
          <p className="text-sm text-muted-foreground">{users.length} usuários registrados</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <UserPlus className="h-4 w-4" />
          Novo Usuário
        </button>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                <div className="h-3 w-60 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className={cn(
                'rounded-xl border border-border bg-card p-4 flex items-center gap-4 transition-opacity',
                !user.is_active && 'opacity-50'
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm flex-shrink-0">
                {user.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{user.full_name}</p>
                  {user.role === 'admin' && (
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Admin</span>
                  )}
                  {!user.is_active && (
                    <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">Inativo</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  Desde {format(new Date(user.created_at), "d 'de' MMM yyyy", { locale: ptBR })}
                  {user.subscriptions?.[0] && ` | Plano: ${user.subscriptions[0].plan}`}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleToggleRole(user.id, user.role)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title={user.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                >
                  {user.role === 'admin' ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleToggleActive(user.id, user.is_active)}
                  className={cn(
                    'rounded-lg p-2 transition-colors',
                    user.is_active
                      ? 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                      : 'text-muted-foreground hover:bg-success/10 hover:text-success'
                  )}
                  title={user.is_active ? 'Desativar' : 'Ativar'}
                >
                  {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create User Dialog */}
      {showCreateDialog && (
        <CreateUserDialog
          onClose={() => setShowCreateDialog(false)}
          onSubmit={async (data) => {
            try {
              await createUser.mutateAsync(data)
              setShowCreateDialog(false)
              toast.success('Usuário criado!')
            } catch (err: any) {
              toast.error(err?.message || 'Erro ao criar usuário')
            }
          }}
          isSubmitting={createUser.isPending}
        />
      )}
    </div>
  )
}

function CreateUserDialog({
  onClose,
  onSubmit,
  isSubmitting,
}: {
  onClose: () => void
  onSubmit: (data: { email: string; password: string; full_name: string; role: string }) => void
  isSubmitting: boolean
}) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !password.trim()) return
    onSubmit({ full_name: fullName.trim(), email: email.trim(), password, role })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Criar Usuário</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome completo *</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nome do usuário"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Senha *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Função</label>
            <div className="flex rounded-lg border border-border bg-muted/50 p-0.5">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                  role === 'user' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                Usuário
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                  role === 'admin' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
