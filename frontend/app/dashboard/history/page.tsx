'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { FileText, ChevronRight, Loader2, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { prescriptionApi } from '@/services/api'
import { cn, statusColor, statusLabel, timeAgo } from '@/lib/utils'
import type { PrescriptionListItem } from '@/types'

export default function HistoryPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['prescriptions', page],
    queryFn: () => prescriptionApi.list(page, 20),
  })

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm('Delete this prescription? This cannot be undone.')) return
    try {
      await prescriptionApi.delete(id)
      toast.success('Prescription deleted.')
      refetch()
    } catch {
      toast.error('Failed to delete.')
    }
  }

  const filtered = (data?.items ?? []).filter((p: PrescriptionListItem) =>
    p.original_filename.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Prescription History</h1>
          <p className="text-muted-foreground text-sm mt-1">All your uploaded prescriptions and results.</p>
        </div>
        <Link href="/dashboard/upload" className="btn-primary text-sm px-4 py-2">+ Upload New</Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          id="history-search"
          type="text"
          placeholder="Search by filename…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
      ) : !filtered.length ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            {search ? 'No results match your search.' : 'No prescriptions uploaded yet.'}
          </p>
          {!search && <Link href="/dashboard/upload" className="btn-primary mt-6 inline-flex">Upload Your First</Link>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p: PrescriptionListItem) => (
            <div key={p.id} className="card-hover p-4 flex items-center gap-4 group">
              <Link href={`/dashboard/result/${p.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{p.original_filename}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(p.created_at)}</p>
                </div>
                <span className={cn('badge flex-shrink-0', statusColor(p.status))}>{statusLabel(p.status)}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 hidden sm:block" />
              </Link>
              <button
                onClick={(e) => handleDelete(p.id, e)}
                className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {data && data.total > 20 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">Previous</button>
          <span className="text-sm text-muted-foreground">Page {page} · {data.total} total</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!data.has_next} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}
