import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  total: number
  perPage: number
  onChange: (page: number) => void
}

export function Pagination({ page, total, perPage, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  return (
    <div className="flex items-center justify-between pt-3 border-t border-white/10">
      <span className="text-xs text-white/50">
        Showing {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-white/70" />
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let p: number
          if (totalPages <= 7) {
            p = i + 1
          } else if (page <= 4) {
            p = i + 1
          } else if (page >= totalPages - 3) {
            p = totalPages - 6 + i
          } else {
            p = page - 3 + i
          }
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                p === page
                  ? 'bg-[#E84545] text-white'
                  : 'text-white/60 hover:bg-white/10'
              }`}
            >
              {p}
            </button>
          )
        })}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-white/70" />
        </button>
      </div>
    </div>
  )
}
