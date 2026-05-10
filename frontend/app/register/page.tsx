'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Loader2, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'

import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/lib/utils'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  preferred_language: z.enum(['en', 'bn']),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { setUser, setTokens } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferred_language: 'en' }
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.register(data)
      setTokens(res.tokens.access_token, res.tokens.refresh_token)
      setUser(res.user)
      toast.success('Account created successfully.')
      router.push('/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground font-sans">
      <Link href="/" className="mb-12 flex items-center gap-2">
        <Activity className="w-5 h-5 text-foreground" />
        <span className="font-semibold tracking-tight text-sm">AiMedico</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[360px]"
      >
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold mb-1">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your details to get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name</label>
            <input
              type="text"
              className={`w-full px-3 py-2 rounded-md border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all ${errors.full_name ? 'border-red-500' : 'border-border'}`}
              placeholder="John Doe"
              {...register('full_name')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
            <input
              type="email"
              className={`w-full px-3 py-2 rounded-md border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all ${errors.email ? 'border-red-500' : 'border-border'}`}
              placeholder="name@example.com"
              {...register('email')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Password</label>
            <input
              type="password"
              className={`w-full px-3 py-2 rounded-md border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all ${errors.password ? 'border-red-500' : 'border-border'}`}
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password
              ? <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              : <p className="text-muted-foreground text-xs mt-1">Min. 8 chars, one uppercase letter, one number.</p>
            }
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Language</label>
            <select
              className="w-full px-3 py-2 rounded-md border border-border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
              {...register('preferred_language')}
            >
              <option value="en">English</option>
              <option value="bn">Bangla</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center h-9 mt-6"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-foreground hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
