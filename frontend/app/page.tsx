import Link from 'next/link'
import { Activity, Brain, FileText, Shield, Zap, Globe, ChevronRight, Upload } from 'lucide-react'

const features = [
  { icon: Upload,    title: 'Instant Upload',       desc: 'Drop prescriptions, images, or PDFs in seconds.' },
  { icon: Brain,     title: 'AI Intelligence',      desc: 'Advanced extraction of medicines and instructions.' },
  { icon: Globe,     title: 'Dual Language',        desc: 'Explanations in both Bangla and English.' },
  { icon: Zap,       title: 'High Performance',     desc: 'Full analysis breakdown in under 30 seconds.' },
  { icon: Shield,    title: 'Safety Detection',     desc: 'Automatic alerts for critical medical keywords.' },
  { icon: FileText,  title: 'Exportable Records',   desc: 'Download or share your analysis securely.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-foreground selection:text-background">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-foreground" />
            <span className="font-semibold tracking-tight text-sm">AiMedico</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">Process</a>
            <a href="#safety" className="hover:text-foreground transition-colors">Safety</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium hover:text-muted-foreground transition-colors">Login</Link>
            <Link href="/register" className="bg-foreground text-background text-sm font-medium px-4 py-1.5 rounded-md hover:bg-foreground/90 transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-8 border border-border">
            <span>Platform 1.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-6">
            Medical transparency,<br />powered by intelligence.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Upload any clinical document. AiMedico extracts and simplifies complex medical terminology into clear, actionable insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="bg-foreground text-background text-sm font-medium px-6 py-3 rounded-md hover:bg-foreground/90 transition-all flex items-center gap-2">
              Start Building <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="bg-transparent border border-border text-foreground text-sm font-medium px-6 py-3 rounded-md hover:bg-muted transition-all">
              View Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* ── Minimalist Preview ─────────────────────────────────────────────── */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-border bg-card p-2 shadow-sm">
            <div className="rounded-lg border border-border bg-background p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
              <Activity className="w-8 h-8 text-muted-foreground mb-4" />
              <h3 className="text-sm font-medium mb-1">Analysis Output</h3>
              <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">{"{ status: 'processed', confidence: 0.99 }"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">Infrastructure for Health.</h2>
            <p className="text-muted-foreground text-lg font-light max-w-xl">
              Enterprise-grade OCR and Natural Language Processing, designed for the modern patient.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {features.map((f) => (
              <div key={f.title} className="group">
                <div className="w-10 h-10 rounded border border-border bg-muted flex items-center justify-center mb-4 transition-colors group-hover:bg-foreground group-hover:text-background">
                  <f.icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process (How It Works) ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">How It Works.</h2>
            <p className="text-muted-foreground text-lg font-light max-w-xl">
              From raw medical document to structured insights in three simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Upload', desc: 'Drag and drop any prescription, lab report, or medical image into the platform.' },
              { step: '02', title: 'Process', desc: 'Our OCR engine extracts the raw text, and AI structures the medical data.' },
              { step: '03', title: 'Understand', desc: 'Receive a clear, simplified breakdown in both English and Bangla.' },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="text-sm font-mono text-muted-foreground mb-4 pb-4 border-b border-border">{s.step}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Safety ─────────────────────────────────────────────────────────── */}
      <section id="safety" className="py-24 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="w-10 h-10 mx-auto mb-6 text-foreground" />
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">Patient Safety First.</h2>
          <p className="text-muted-foreground text-lg font-light leading-relaxed mb-8">
            AiMedico is an educational tool designed to help patients understand complex medical terminology. It is <strong>not a medical device</strong> and cannot replace professional medical advice, diagnosis, or treatment.
          </p>
          <p className="text-sm text-muted-foreground bg-muted inline-block px-4 py-2 rounded-md border border-border">
            Always consult your doctor or pharmacist before making changes to your medication.
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-4">
            <Activity className="w-4 h-4 text-foreground opacity-50" />
            <span>© 2026 AIMEDICO SYSTEMS.</span>
          </div>
          <p className="text-center md:text-right opacity-60">
            EDUCATIONAL PURPOSES ONLY. NOT A MEDICAL DEVICE.
          </p>
        </div>
      </footer>
    </div>
  )
}
