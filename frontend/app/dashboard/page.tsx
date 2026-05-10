'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Upload, FileText, Clock, CheckCircle, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react'
import { prescriptionApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { cn, statusColor, statusLabel, timeAgo, formatBytes } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions', 1],
    queryFn: () => prescriptionApi.list(1, 5),
  })

  const stats = [
    { label: 'Total Uploads',     value: prescriptions?.total ?? '—',     icon: FileText,      color: 'from-brand-500 to-brand-600' },
    { label: 'Analyses Complete', value: prescriptions?.items.filter(p => p.status === 'ai_done').length ?? '—', icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
    { label: 'Processing',        value: prescriptions?.items.filter(p => p.status === 'uploaded' || p.status === 'ocr_done').length ?? '—', icon: Clock, color: 'from-amber-500 to-orange-500' },
    { label: 'Failed',            value: prescriptions?.items.filter(p => p.status === 'failed').length ?? '—', icon: AlertTriangle, color: 'from-red-500 to-rose-600' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.full_name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your prescription analysis overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', stat.color)}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Upload CTA */}
      <Link href="/dashboard/upload" className="block">
        <div className="card p-6 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-2xl hover:shadow-xl hover:shadow-brand-500/30 transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">Upload a Prescription</h2>
              <p className="text-brand-100 text-sm">Drag & drop your image or PDF. AI analysis starts automatically.</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </Link>

      {/* Recent Prescriptions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Recent Uploads</h2>
          <Link href="/dashboard/history" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : !prescriptions?.items.length ? (
          <div className="card p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No prescriptions yet.</p>
            <p className="text-muted-foreground text-sm mt-1">Upload your first prescription to get started.</p>
            <Link href="/dashboard/upload" className="btn-primary mt-6 inline-flex">Upload Now</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {prescriptions.items.map((p) => (
              <Link key={p.id} href={`/dashboard/result/${p.id}`} className="card-hover p-4 flex items-center gap-4 block">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{p.original_filename}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(p.created_at)}</p>
                </div>
                <span className={cn('badge', statusColor(p.status))}>{statusLabel(p.status)}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="disclaimer-box">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed">
          <strong>Educational Use Only:</strong> AiMedico is not a medical device. Always consult your doctor or pharmacist before making any changes to your medication.
        </p>
      </div>
    </div>
  )
}
