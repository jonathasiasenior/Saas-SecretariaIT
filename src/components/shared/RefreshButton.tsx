import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

export function RefreshButton() {
  const [spinning, setSpinning] = useState(false)
  const queryClient = useQueryClient()

  const handleRefresh = async () => {
    setSpinning(true)
    await queryClient.invalidateQueries()
    setTimeout(() => setSpinning(false), 800)
  }

  return (
    <button
      onClick={handleRefresh}
      className="flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      title="Atualizar"
    >
      <RefreshCw className={cn('h-4 w-4 transition-transform', spinning && 'animate-spin')} />
      <span className="hidden sm:inline">Atualizar</span>
    </button>
  )
}
