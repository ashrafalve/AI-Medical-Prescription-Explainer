'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Upload, History, User, LogOut,
  Heart, Moon, Sun, Bell, ChevronRight, Menu, X
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard',         label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/dashboard/upload',  label: 'Upload',     icon: Upload },
  { href: '/dashboard/history', label: 'History',    icon: History },
  { href: '/dashboard/profile', label: 'Profile',    icon: User },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const handleLogout = () => {
    logout()
    toast.success('Signed out successfully.')
    router.push('/')
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={cn(
      'flex flex-col h-full bg-card border-r border-border',
      mobile ? 'w-72' : 'w-64'
    )}>
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Ai<span className="gradient-text">Medico</span>
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                active
                  ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-4.5 h-4.5', active ? 'text-brand-600 dark:text-brand-400' : 'text-muted-foreground group-hover:text-foreground')} style={{ width: '18px', height: '18px' }} />
              {item.label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand-400" />}
            </Link>
          )
        })}
      </nav>

      {/* User + Controls */}
      <div className="p-4 border-t border-border space-y-3">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-accent/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">
              {user?.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <motion.div
            initial={{ x: -300 }} animate={{ x: 0 }}
            exit={{ x: -300 }} transition={{ type: 'spring', damping: 25 }}
            className="relative z-50"
          >
            <Sidebar mobile />
          </motion.div>
          <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 z-50 p-2 rounded-lg bg-card text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-6 bg-card/80 backdrop-blur border-b border-border flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl hover:bg-accent transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
            <Link href="/dashboard/upload" className="btn-primary text-sm px-4 py-2">
              <Upload className="w-4 h-4" /> Upload
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
