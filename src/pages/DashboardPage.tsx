import { ArrowRight, HeartHandshake, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RefreshButton } from '@/components/shared/RefreshButton'
import { CalendarView } from '@/components/calendar/CalendarView'
import { ProcessingIndicator } from '@/components/input/ProcessingIndicator'

export function DashboardPage() {
  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(236,72,153,0.16),transparent_26%),linear-gradient(135deg,rgba(124,58,237,0.08),transparent_58%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-4 w-4" />
              Novo modulo
            </div>
            <h1 className="mt-4 [font-family:'Sora',sans-serif] text-3xl font-semibold leading-tight">
              Conexao Gospel chegou com visual premium e jornadas pensadas para conversao.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Agora o app tambem tem um espaco dedicado para relacionamento intencional e rede profissional com layout mais forte, filtros e interacoes locais.
            </p>
          </div>

          <Link
            to="/conexao-gospel"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
          >
            Abrir Conexao Gospel
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
            <p className="text-sm font-semibold text-foreground">QTC com afinidade</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Feed organizado, filtros e cards prontos para evolucao com backend.</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
            <p className="text-sm font-semibold text-foreground">Rede Pro com portfolio</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Posts editoriais, prova social e CTA claros para networking e vendas.</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
            <div className="flex items-center gap-2 text-primary">
              <HeartHandshake className="h-4 w-4" />
              <p className="text-sm font-semibold">UX mais forte</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Hierarquia visual melhorada para comunicar valor mais rapido em mobile e desktop.</p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Minha Agenda</h2>
          <p className="text-sm text-muted-foreground">Seus compromissos organizados</p>
        </div>
        <RefreshButton />
      </div>
      <ProcessingIndicator />
      <CalendarView />
    </div>
  )
}
