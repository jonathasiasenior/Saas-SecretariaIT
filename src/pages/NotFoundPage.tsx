import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-6">Página não encontrada</p>
        <Link
          to="/"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-primary-foreground font-medium hover:opacity-90"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
