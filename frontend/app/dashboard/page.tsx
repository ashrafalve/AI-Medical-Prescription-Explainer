'use client'

import { useEffect, useState } from 'react'
import { prescriptionApi } from '@/services/api'
import { PrescriptionListItem } from '@/types'
import { Activity, Clock, FileText, Upload } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 })
  const [recent, setRecent] = useState<PrescriptionListItem[]>([])

  useEffect(() => {
    prescriptionApi.list(1, 5).then((data) => {
      const items = data.items ?? []
      setRecent(items)
      setStats({
        total: data.total ?? items.length,
        pending: items.filter((d: PrescriptionListItem) => d.status === 'ocr_done' || d.status === 'uploaded').length,
        completed: items.filter((d: PrescriptionListItem) => d.status === 'ai_done').length,
      })
    }).catch(() => {})
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Here&apos;s a summary of your medical documents.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Scanned', value: stats.total, icon: FileText },
          { label: 'Processing', value: stats.pending, icon: Clock },
          { label: 'Completed', value: stats.completed, icon: Activity },
        ].map((s) => (
          <div key={s.label} className="p-5 border border-border bg-card rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <p className="text-3xl font-semibold mt-1">{s.value}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <s.icon className="w-5 h-5 text-foreground" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action */}
      <div className="p-6 border border-border bg-background rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold">Upload new document</h3>
          <p className="text-sm text-muted-foreground mt-1">Analyze a new prescription or medical report instantly.</p>
        </div>
        <Link
          href="/dashboard/upload"
          className="bg-foreground text-background px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> Start Upload
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-semibold mb-4">Recent Documents</h3>
        <div className="border border-border bg-card rounded-xl overflow-hidden">
          {recent.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No documents yet. Upload your first prescription above.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs">
                        {p.original_filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/result/${p.id}`}
                    className="text-sm font-medium px-3 py-1.5 border border-border rounded-md hover:bg-muted transition-colors"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
