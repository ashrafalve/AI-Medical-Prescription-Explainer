'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Heart, Loader2, Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'

import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/lib/utils'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  confirm_password: z.string(),
  preferred_language: z.enum(['en', 'bn']).default('en'),
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { setUser, setTokens } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferred_language: 'en' },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const { confirm_password, ...payload } = data
      const res = await authApi.register(payload)
      setTokens(res.tokens.access_token, res.tokens.refresh_token)
      setUser(res.user)
      toast.success('Account created! Welcome to AiMedico 🎉')
      router.push('/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="absolute inset-0 bg-hero-pattern opacity-30 dark:opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">AiMedico</span>
          </Link>
          <h1 className="text-3xl font-extrabold">Create your account</h1>
          <p className="text-muted-foreground mt-2">
            Already have one?{' '}
            <Link href="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>

        <div className="glass-card">
          <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input id="full_name" type="text" placeholder="Rahim Uddin" className={`input pl-10 ${errors.full_name ? 'border-red-400' : ''}`} {...register('full_name')} />
              </div>
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input id="reg-email" type="email" placeholder="you@example.com" className={`input pl-10 ${errors.email ? 'border-red-400' : ''}`} {...register('email')} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input id="reg-password" type={showPass ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number" className={`input pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`} {...register('password')} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm_password" className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input id="confirm_password" type="password" placeholder="••••••••" className={`input pl-10 ${errors.confirm_password ? 'border-red-400' : ''}`} {...register('confirm_password')} />
              </div>
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            {/* Language */}
            <div>
              <label className="label">Preferred Language</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ value:'en', label:'🇬🇧 English' }, { value:'bn', label:'🇧🇩 বাংলা' }].map(l => (
                  <label key={l.value} className="flex items-center gap-2 p-3 rounded-xl border border-border cursor-pointer hover:border-brand-400 transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 dark:has-[:checked]:bg-brand-950/30 text-sm font-medium">
                    <input type="radio" value={l.value} {...register('preferred_language')} className="accent-brand-600" />
                    {l.label}
                  </label>
                ))}
              </div>
            </div>

            <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-5 leading-relaxed">
            By registering, you acknowledge that AiMedico is for <strong>educational purposes only</strong> and is not a substitute for professional medical advice.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
