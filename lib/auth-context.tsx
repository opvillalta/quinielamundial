'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { client } from './supabase/client'
import type { User } from './api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  setAuth: (user: User, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, isLoading: true })

  useEffect(() => {
    // Obtener sesión activa al cargar
    client.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const supaUser = session.user
        setState({
          user: {
            id: supaUser.id,
            name: supaUser.user_metadata?.display_name ?? supaUser.email?.split('@')[0] ?? 'Usuario',
            email: supaUser.email ?? '',
            points: 0,
            rank: 0,
          },
          token: session.access_token,
          isLoading: false,
        })
      } else {
        setState(s => ({ ...s, isLoading: false }))
      }
    })

    // Escuchar cambios de sesión (magic link, logout, etc.)
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const supaUser = session.user
        setState({
          user: {
            id: supaUser.id,
            name: supaUser.user_metadata?.display_name ?? supaUser.email?.split('@')[0] ?? 'Usuario',
            email: supaUser.email ?? '',
            points: 0,
            rank: 0,
          },
          token: session.access_token,
          isLoading: false,
        })
      } else {
        setState({ user: null, token: null, isLoading: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Mantener compatibilidad con login manual (mock/API)
  const setAuth = useCallback((user: User, token: string) => {
    setState({ user, token, isLoading: false })
  }, [])

  const logout = useCallback(async () => {
    await client.auth.signOut()
    setState({ user: null, token: null, isLoading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
