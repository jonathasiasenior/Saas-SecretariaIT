import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { useUserSettings } from '@/hooks/useUserSettings'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Bell, Mail, MessageSquare, Smartphone, User, Clock, Save, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SettingsPage() {
  const { profile, user } = useAuth()
  const { settings, isLoading, updateSettings } = useUserSettings()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Email: usar do profile ou fallback do auth user
  const userEmail = profile?.email || user?.email || ''
  const userRole = profile?.role || 'user'

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  const handleSaveProfile = async () => {
    if (!user) return
    setSavingProfile(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone: phone || null } as never)
        .eq('id', user.id)
      if (error) throw error
      toast.success('Perfil atualizado!')
    } catch {
      toast.error('Erro ao salvar perfil')
    }
    setSavingProfile(false)
  }

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await updateSettings.mutateAsync({ [key]: !value } as never)
      toast.success('Configuração atualizada!')
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-sm text-muted-foreground">Personalize sua experiência</p>
      </div>

      {/* Profile Info - Editable */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Perfil</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="settingsName">Nome</label>
            <input
              id="settingsName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <div className="flex h-10 w-full items-center rounded-lg border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
              {userEmail}
            </div>
            <p className="text-[11px] text-muted-foreground">Email não pode ser alterado</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="settingsPhone">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                WhatsApp / Telefone
              </span>
            </label>
            <input
              id="settingsPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            <p className="text-[11px] text-muted-foreground">Usado para notificações via WhatsApp</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Função</label>
            <div className="flex h-10 w-full items-center rounded-lg border border-input bg-muted/50 px-3 text-sm text-muted-foreground capitalize">
              {userRole === 'admin' ? 'Administrador' : 'Usuário'}
            </div>
          </div>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {savingProfile ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar Perfil
        </button>
      </div>

      {/* Theme */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full bg-primary" />
          <h3 className="text-lg font-semibold">Aparência</h3>
        </div>
        <ThemeToggle />
      </div>

      {/* Notification Channels */}
      {!isLoading && settings && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Canais de Notificação</h3>
          </div>
          <div className="space-y-3">
            <SettingToggle
              icon={Smartphone}
              label="Push no celular"
              description="Notificações nativas no navegador/app"
              checked={settings.notification_push}
              onChange={() => handleToggle('notification_push', settings.notification_push)}
            />
            <SettingToggle
              icon={Mail}
              label="Email"
              description={`Notificações para ${userEmail || 'seu email'}`}
              checked={settings.notification_email}
              onChange={() => handleToggle('notification_email', settings.notification_email)}
            />
            <SettingToggle
              icon={MessageSquare}
              label="WhatsApp"
              description={phone ? `Notificações para ${phone}` : 'Preencha o telefone no perfil acima'}
              checked={settings.notification_whatsapp}
              onChange={() => {
                if (!phone && !settings.notification_whatsapp) {
                  toast.error('Preencha o telefone no perfil antes de ativar o WhatsApp')
                  return
                }
                handleToggle('notification_whatsapp', settings.notification_whatsapp)
              }}
            />
          </div>
        </div>
      )}

      {/* Notification Timing */}
      {!isLoading && settings && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Quando Notificar</h3>
          </div>
          <p className="text-sm text-muted-foreground">Padrão para novos eventos</p>
          <div className="space-y-3">
            <SettingToggle
              label="24 horas antes"
              checked={settings.default_notify_24h}
              onChange={() => handleToggle('default_notify_24h', settings.default_notify_24h)}
            />
            <SettingToggle
              label="8 horas antes"
              checked={settings.default_notify_8h}
              onChange={() => handleToggle('default_notify_8h', settings.default_notify_8h)}
            />
            <SettingToggle
              label="1 hora antes"
              checked={settings.default_notify_1h}
              onChange={() => handleToggle('default_notify_1h', settings.default_notify_1h)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function SettingToggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  description?: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        <div>
          <p className="text-sm font-medium">{label}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div
        className={cn(
          'flex h-6 w-11 items-center rounded-full p-0.5 transition-colors flex-shrink-0',
          checked ? 'bg-primary' : 'bg-muted'
        )}
      >
        <div
          className={cn(
            'h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </div>
    </button>
  )
}
