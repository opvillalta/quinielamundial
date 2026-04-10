'use client'

import { AuthProvider, useAuth } from '@/lib/auth-context'
import { AuthScreen } from '@/components/auth/auth-screen'
import { AppShell } from '@/components/app-shell'

function AppRouter() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary animate-pulse" />
          <div className="w-24 h-2 bg-secondary rounded-full animate-pulse" />
        </div>
      </div>
    )
  }

  return user ? <AppShell /> : <AuthScreen />
}

export default function Page() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
