// AiMedico - Zustand Auth Store
// Global authentication state with persistence and token management.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '@/types'
import { tokenStore } from '@/services/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  setUser: (user: User) => void
  setTokens: (access: string, refresh: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setTokens: (access, refresh) => {
        tokenStore.setTokens(access, refresh)
        set({ isAuthenticated: true })
      },

      logout: () => {
        tokenStore.clear()
        set({ user: null, isAuthenticated: false })
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'aimedico-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
