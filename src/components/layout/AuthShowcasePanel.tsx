import { HeartHandshake, Sparkles, TrendingUp } from 'lucide-react'

const highlights = [
  {
    title: 'Conexao Gospel',
    description: 'Relacionamento intencional e rede profissional dentro da mesma experiencia.',
  },
  {
    title: 'Secretaria com IA',
    description: 'Agenda, notas e fluxos operacionais continuam acessiveis no mesmo ambiente.',
  },
  {
    title: 'Layout de produto',
    description: 'Mais clareza visual, mais confianca e menos friccao na tomada de decisao.',
  },
]

export function AuthShowcasePanel() {
  return (
    <div className="relative hidden min-h-[620px] overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,rgba(17,24,39,0.98),rgba(91,33,182,0.95),rgba(217,119,6,0.92))] p-8 text-white shadow-[0_28px_90px_rgba(15,23,42,0.35)] lg:flex lg:flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(251,191,36,0.28),transparent_24%),linear-gradient(180deg,transparent,rgba(15,23,42,0.24))]" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Experiencia premium</p>
          <h2 className="[font-family:'Sora',sans-serif] text-3xl font-semibold leading-tight">
            Um SaaS mais bonito, organizado e pronto para vender melhor.
          </h2>
        </div>
      </div>

      <div className="relative mt-10 space-y-4">
        {highlights.map((item) => (
          <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <p className="text-lg font-semibold">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-white/75">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-auto grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/25 p-5">
          <div className="flex items-center gap-3">
            <HeartHandshake className="h-5 w-5 text-pink-200" />
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">Conversao</p>
          </div>
          <p className="mt-3 text-3xl font-bold">+3.2x</p>
          <p className="mt-2 text-sm text-white/75">mais interacoes iniciais em jornadas com CTA contextual.</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/25 p-5">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-amber-200" />
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">Usabilidade</p>
          </div>
          <p className="mt-3 text-3xl font-bold">94%</p>
          <p className="mt-2 text-sm text-white/75">dos perfis concluem melhor quando a hierarquia visual fica clara.</p>
        </div>
      </div>
    </div>
  )
}
