'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { User, Mail, Globe, Lock, Save, Loader2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { userApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/lib/utils'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [tab, setTab] = useState<'profile' | 'security'>('profile')

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm({
    defaultValues: { full_name: user?.full_name || '', preferred_language: user?.preferred_language || 'en' }
  })

  const { register: regPass, handleSubmit: handlePass, reset: resetPass, formState: { errors: passErrors } } = useForm<{
    current_password: string; new_password: string; confirm_password: string
  }>()

  const updateMutation = useMutation({
    mutationFn: (data: { full_name?: string; preferred_language?: string }) => userApi.updateProfile(data),
    onSuccess: (updated) => { setUser(updated); toast.success('Profile updated!') },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const passMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string; confirm_password: string }) => userApi.changePassword(data),
    onSuccess: () => { toast.success('Password changed successfully!'); resetPass() },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account information and security.</p>
      </div>

      {/* Avatar card */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg flex-shrink-0">
          <span className="text-white text-2xl font-black">{user?.full_name?.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <p className="text-lg font-bold">{user?.full_name}</p>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
          <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400 mt-2">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-border overflow-hidden w-fit">
        {[{ key: 'profile', label: 'Profile', icon: User }, { key: 'security', label: 'Security', icon: Lock }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? 'bg-brand-600 text-white' : 'bg-card text-muted-foreground hover:bg-accent'}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <form id="profile-form" onSubmit={handleProfile((d) => updateMutation.mutate(d))} className="card p-6 space-y-5">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" className={`input pl-10 ${profileErrors.full_name ? 'border-red-400' : ''}`} {...regProfile('full_name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
            </div>
            {profileErrors.full_name && <p className="text-red-500 text-xs mt-1">{profileErrors.full_name.message}</p>}
          </div>

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" value={user?.email} disabled className="input pl-10 opacity-60 cursor-not-allowed" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="label">Preferred Language</label>
            <div className="grid grid-cols-2 gap-3">
              {[{ value: 'en', label: '🇬🇧 English' }, { value: 'bn', label: '🇧🇩 বাংলা' }].map(l => (
                <label key={l.value} className="flex items-center gap-2 p-3 rounded-xl border border-border cursor-pointer hover:border-brand-400 transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 dark:has-[:checked]:bg-brand-950/30 text-sm font-medium">
                  <input type="radio" value={l.value} {...regProfile('preferred_language')} className="accent-brand-600" />
                  {l.label}
                </label>
              ))}
            </div>
          </div>

          <button id="save-profile-btn" type="submit" disabled={updateMutation.isPending} className="btn-primary">
            {updateMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </form>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <form id="change-password-form" onSubmit={handlePass((d) => passMutation.mutate(d))} className="card p-6 space-y-5">
          {['current_password', 'new_password', 'confirm_password'].map((field, i) => (
            <div key={field}>
              <label className="label">{['Current Password', 'New Password', 'Confirm New Password'][i]}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="password" placeholder="••••••••" className="input pl-10" {...regPass(field as any, { required: 'Required', minLength: field !== 'current_password' ? { value: 8, message: 'Min 8 chars' } : undefined })} />
              </div>
              {(passErrors as any)[field] && <p className="text-red-500 text-xs mt-1">{(passErrors as any)[field]?.message}</p>}
            </div>
          ))}
          <button id="change-password-btn" type="submit" disabled={passMutation.isPending} className="btn-primary">
            {passMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Changing…</> : <><Shield className="w-4 h-4" /> Change Password</>}
          </button>
        </form>
      )}
    </div>
  )
}
