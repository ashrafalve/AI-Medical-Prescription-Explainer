'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pill, Clock, AlertTriangle, FlaskConical, Stethoscope, CalendarCheck,
  Copy, Download, Loader2, CheckCircle, RefreshCw, ChevronDown, ChevronUp, Shield
} from 'lucide-react'
import toast from 'react-hot-toast'
import { aiApi, prescriptionApi } from '@/services/api'
import { cn, emergencyColor, copyToClipboard, statusLabel } from '@/lib/utils'
import type { MedicineItem, WarningItem, AIAnalysis } from '@/types'

// ── Sub-components ────────────────────────────────────────────────────────────

function MedicineCard({ med }: { med: MedicineItem }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="card-hover p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center flex-shrink-0">
            <Pill className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground">{med.name}</h3>
            {med.generic_name && <p className="text-xs text-muted-foreground">{med.generic_name}</p>}
            {med.dosage && (
              <div className="flex flex-wrap gap-2 mt-2">
                {med.dosage && <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{med.dosage}</span>}
                {med.frequency && <span className="badge bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">{med.frequency}</span>}
                {med.duration && <span className="badge bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">{med.duration}</span>}
                {med.timing && <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{med.timing}</span>}
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-accent transition-colors flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
      </div>

      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 space-y-3 border-t border-border pt-4">
          {med.explanation_en && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Explanation (English)</p>
              <p className="text-sm text-foreground leading-relaxed">{med.explanation_en}</p>
            </div>
          )}
          {med.explanation_bn && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">ব্যাখ্যা (বাংলা)</p>
              <p className="text-sm text-foreground leading-relaxed">{med.explanation_bn}</p>
            </div>
          )}
          {med.side_effects && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Common Side Effects</p>
              <p className="text-sm text-foreground">{med.side_effects}</p>
            </div>
          )}
          {med.warnings && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">⚠️ Warning</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">{med.warnings}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

function WarningBanner({ warning }: { warning: WarningItem }) {
  const cls = {
    critical: 'emergency-critical',
    high: 'emergency-high',
    medium: 'emergency-medium',
    low: 'disclaimer-box',
  }[warning.level] || 'disclaimer-box'

  return (
    <div className={cls}>
      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-sm">{warning.message_en}</p>
        {warning.message_bn && <p className="text-sm mt-1 opacity-90">{warning.message_bn}</p>}
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="section-title">
        <Icon className="w-5 h-5 text-brand-500" />
        {title}
      </h2>
      {children}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ResultPage() {
  const { id } = useParams<{ id: string }>()
  const [lang, setLang] = useState<'en' | 'bn'>('en')

  const { data: prescription } = useQuery({
    queryKey: ['prescription', id],
    queryFn: () => prescriptionApi.getById(id),
  })

  const { data: result, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ai-result', id],
    queryFn: () => aiApi.getResult(id),
    refetchInterval: (data) =>
      data?.status === 'completed' || data?.status === 'failed' ? false : 5000,
  })

  const analysis = result?.analysis as AIAnalysis | undefined
  const isProcessing = !result || result.status === 'pending' || result.status === 'processing'
  const isFailed = result?.status === 'failed'

  const handleCopy = async () => {
    if (!analysis) return
    const text = `AiMedico Analysis\n\nSummary:\n${lang === 'bn' ? analysis.summary_bn : analysis.summary_en}\n\nMedicines:\n${analysis.medicines.map(m => `• ${m.name}: ${m.explanation_en || ''}`).join('\n')}\n\n⚠️ This is not medical advice.`
    const ok = await copyToClipboard(text)
    toast.success(ok ? 'Analysis copied to clipboard!' : 'Copy failed.')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Analysis Result</h1>
          {prescription && (
            <p className="text-muted-foreground text-sm mt-1 truncate max-w-sm">{prescription.original_filename}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Language toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden">
            {(['en', 'bn'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn('px-3 py-1.5 text-xs font-semibold transition-colors', lang === l ? 'bg-brand-600 text-white' : 'bg-card text-muted-foreground hover:bg-accent')}
              >
                {l === 'en' ? '🇬🇧 EN' : '🇧🇩 BN'}
              </button>
            ))}
          </div>
          <button onClick={handleCopy} disabled={!analysis} className="btn-secondary text-sm px-3 py-2">
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button onClick={() => refetch()} className="p-2 rounded-xl border border-border hover:bg-accent transition-colors">
            <RefreshCw className={cn('w-4 h-4 text-muted-foreground', isRefetching && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="card p-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
            <div>
              <h2 className="font-bold text-lg">AI Analysis in Progress</h2>
              <p className="text-muted-foreground text-sm mt-1">Extracting text and analysing your prescription…</p>
              <p className="text-xs text-muted-foreground mt-2">This usually takes 15–30 seconds.</p>
            </div>
            <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {isFailed && (
        <div className="emergency-medium">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Analysis Failed</p>
            <p className="text-sm mt-1">{result?.error_message || 'An error occurred during analysis. Please try uploading again.'}</p>
          </div>
        </div>
      )}

      {/* Result content */}
      {result?.status === 'completed' && analysis && (
        <AnimatePresence>
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Emergency banner */}
            {result.emergency_level !== 'none' && (
              <div className={cn(
                'flex items-start gap-3 p-5 rounded-2xl border-2',
                result.emergency_level === 'critical' ? 'bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-600 animate-pulse' :
                result.emergency_level === 'high' ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700' :
                'bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-700'
              )}>
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800 dark:text-red-300">
                    🚨 Emergency Level: {result.emergency_level.toUpperCase()}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    Detected keywords: {result.analysis?.emergency_keywords_found?.join(', ')}
                  </p>
                  <p className="text-sm font-semibold mt-2 text-red-800 dark:text-red-300">
                    Please seek immediate medical attention if needed.
                  </p>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h2 className="font-bold text-foreground">Patient Summary</h2>
                <span className={cn('badge ml-auto', emergencyColor(result.emergency_level))}>
                  {result.emergency_level === 'none' ? 'No Emergency' : `⚠️ ${result.emergency_level}`}
                </span>
              </div>
              <p className="text-foreground leading-relaxed">
                {lang === 'bn' ? analysis.summary_bn || analysis.summary_en : analysis.summary_en}
              </p>
            </div>

            {/* Warnings */}
            {analysis.warnings.length > 0 && (
              <Section title="Warnings & Alerts" icon={AlertTriangle}>
                <div className="space-y-3">
                  {analysis.warnings.map((w, i) => <WarningBanner key={i} warning={w} />)}
                </div>
              </Section>
            )}

            {/* Medicines */}
            {analysis.medicines.length > 0 && (
              <Section title={`Medicines (${analysis.medicines.length})`} icon={Pill}>
                <div className="space-y-3">
                  {analysis.medicines.map((m, i) => <MedicineCard key={i} med={m} />)}
                </div>
              </Section>
            )}

            {/* Tests */}
            {analysis.tests.length > 0 && (
              <Section title="Tests Ordered" icon={FlaskConical}>
                <div className="space-y-3">
                  {analysis.tests.map((t, i) => (
                    <div key={i} className="card p-4">
                      <p className="font-semibold">{t.name}</p>
                      {t.normal_range && <p className="text-xs text-muted-foreground">Normal range: {t.normal_range}</p>}
                      <p className="text-sm text-foreground mt-1">{lang === 'bn' ? t.explanation_bn || t.explanation_en : t.explanation_en}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Conditions */}
            {analysis.conditions.length > 0 && (
              <Section title="Conditions / Diagnoses" icon={Stethoscope}>
                <div className="grid md:grid-cols-2 gap-3">
                  {analysis.conditions.map((c, i) => (
                    <div key={i} className="card p-4">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{lang === 'bn' ? c.explanation_bn || c.explanation_en : c.explanation_en}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Follow-up */}
            {analysis.followup.length > 0 && (
              <Section title="Follow-up Recommendations" icon={CalendarCheck}>
                <div className="space-y-2">
                  {analysis.followup.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                      <span className={cn('badge flex-shrink-0 mt-0.5',
                        f.urgency === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        f.urgency === 'soon' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      )}>
                        {f.urgency || 'routine'}
                      </span>
                      <p className="text-sm text-foreground">
                        {lang === 'bn' ? f.recommendation_bn || f.recommendation_en : f.recommendation_en}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Disclaimer */}
            <div className="disclaimer-box">
              <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">{analysis.disclaimer_en}</p>
            </div>

            {/* Meta */}
            {result.ai_model_used && (
              <p className="text-xs text-muted-foreground text-center">
                Analysed with {result.ai_model_used} · {result.total_tokens} tokens · {result.processing_time_ms}ms
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
