'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { client } from '@/lib/supabase/client'
import { Trophy } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Supabase JS detecta automáticamente el token en la URL
    // y establece la sesión. onAuthStateChange en el contexto
    // lo capturará y redirigirá al usuario.
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/')
      }
    })

    // Fallback: si ya hay sesión activa, redirigir directo
    client.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/')
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center animate-pulse">
        <Trophy className="w-9 h-9 text-primary-foreground" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-foreground font-semibold text-lg">Verificando sesión...</p>
        <p className="text-muted-foreground text-sm">Serás redirigido en un momento</p>
      </div>
    </div>
  )
}
