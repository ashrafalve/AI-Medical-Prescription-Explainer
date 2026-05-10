import Link from 'next/link'
import { Activity, Brain, FileText, Shield, Zap, Globe, ChevronRight, Heart, Star, Upload } from 'lucide-react'

const features = [
  { icon: Upload,    title: 'Easy Upload',          desc: 'Drag & drop prescriptions, images, or PDFs in seconds.' },
  { icon: Brain,     title: 'AI Analysis',           desc: 'GPT-4o extracts and explains every medicine and instruction.' },
  { icon: Globe,     title: 'Bangla & English',      desc: 'Explanations in both languages for all patients.' },
  { icon: Zap,       title: 'Instant Results',       desc: 'Get a full breakdown in under 30 seconds.' },
  { icon: Shield,    title: 'Emergency Detection',   desc: 'Automatic alerts for dangerous medical keywords.' },
  { icon: FileText,  title: 'Export Summary',        desc: 'Download or share your analysis anytime.' },
]

const stats = [
  { value: '10K+', label: 'Prescriptions Analysed' },
  { value: '99%',  label: 'Extraction Accuracy' },
  { value: '2',    label: 'Languages Supported' },
  { value: '<30s', label: 'Average Analysis Time' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Ai<span className="gradient-text">Medico</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#safety" className="hover:text-foreground transition-colors">Safety</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm px-4 py-2">Sign in</Link>
            <Link href="/register" className="btn-primary text-sm px-4 py-2">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-sm font-medium mb-8 animate-fade-in">
            <Star className="w-3.5 h-3.5 fill-current" />
            AI-Powered Healthcare Assistant
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none mb-6 animate-slide-up">
            Understand Your<br />
            <span className="gradient-text">Prescription</span>{' '}
            <span className="text-foreground">Instantly</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            Upload any doctor prescription or medical report. AiMedico uses advanced AI and OCR to
            explain medicines, dosage, and instructions in{' '}
            <strong className="text-foreground">simple English and Bangla</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link href="/register" className="btn-primary text-base px-8 py-4 shadow-xl shadow-brand-500/30">
              Start for Free <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-4">
              Sign in to Dashboard
            </Link>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            ⚠️ AiMedico is for educational purposes only. Always consult your doctor.
          </p>
        </div>

        {/* Hero preview card */}
        <div className="max-w-3xl mx-auto mt-16 animate-float">
          <div className="glass-card shadow-2xl rounded-3xl overflow-hidden border border-white/20">
            <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-4 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/30" />
                <div className="w-3 h-3 rounded-full bg-white/30" />
                <div className="w-3 h-3 rounded-full bg-white/30" />
              </div>
              <span className="text-white/80 text-sm font-medium">AI Analysis Result</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <Activity className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300 text-sm">Amoxicillin 500mg</p>
                  <p className="text-green-700 dark:text-green-400 text-sm mt-1">Take 1 capsule 3 times daily (every 8 hours), preferably after meals. Complete the full 7-day course.</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                {[['Frequency','3× Daily'],['Duration','7 Days'],['Timing','After Meals']].map(([k,v]) => (
                  <div key={k} className="bg-card border border-border rounded-xl p-3">
                    <p className="text-muted-foreground text-xs">{k}</p>
                    <p className="font-bold text-foreground mt-1">{v}</p>
                  </div>
                ))}
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-brand-500 to-brand-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-border bg-card/30">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold gradient-text">{s.value}</p>
              <p className="text-muted-foreground text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold tracking-tight">
              Everything you need to{' '}
              <span className="gradient-text">understand your health</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
              AiMedico combines cutting-edge AI with medical knowledge to make prescriptions accessible to everyone.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-hover p-6 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/50 dark:to-brand-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <f.icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 bg-card/30 border-y border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold tracking-tight mb-14">
            How it <span className="gradient-text">works</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step:'01', title:'Upload', desc:'Drag & drop your prescription image or PDF.' },
              { step:'02', title:'AI Extracts', desc:'OCR reads the text; AI identifies every medicine and instruction.' },
              { step:'03', title:'Understand', desc:'Read the simple explanation in English or Bangla.' },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
                  <span className="text-white font-black text-lg">{s.step}</span>
                </div>
                <h3 className="font-bold text-xl mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Safety ─────────────────────────────────────────────────────────── */}
      <section id="safety" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="disclaimer-box">
            <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200 mb-1">Medical Safety Notice</p>
              <p className="text-sm leading-relaxed">
                AiMedico is an <strong>educational tool only</strong>. It is not a medical device and cannot
                replace professional medical advice, diagnosis, or treatment. Always consult your doctor or pharmacist
                before making any changes to your medication. The AI may make errors — never rely solely on this tool for medical decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-12 bg-gradient-to-br from-brand-600/10 to-purple-600/5 border border-brand-200/30 dark:border-brand-800/30">
            <h2 className="text-4xl font-extrabold mb-4">Ready to understand your prescription?</h2>
            <p className="text-muted-foreground mb-8">Free to get started. No credit card required.</p>
            <Link href="/register" className="btn-primary text-lg px-10 py-4 shadow-xl shadow-brand-500/30">
              Get Started Free <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-brand-500" />
            <span>© 2026 AiMedico. All rights reserved.</span>
          </div>
          <p className="text-xs text-center">
            Not a medical device. For educational purposes only. Always consult a healthcare professional.
          </p>
        </div>
      </footer>
    </div>
  )
}
