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
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setTokens } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data)
      setTokens(res.tokens.access_token, res.tokens.refresh_token)
      setUser(res.user)
      toast.success('Authenticated successfully.')
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
          <h1 className="text-xl font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center h-9"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-foreground hover:underline">Create one</Link>
        </p>
      </motion.div>
    </div>
  )
}
