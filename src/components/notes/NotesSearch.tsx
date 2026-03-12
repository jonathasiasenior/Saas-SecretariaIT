import { Search } from 'lucide-react'

interface NotesSearchProps {
  value: string
  onChange: (value: string) => void
}

export function NotesSearch({ value, onChange }: NotesSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar anotações..."
        className="flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
      />
    </div>
  )
}
