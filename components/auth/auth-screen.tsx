'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, ArrowRight, User, ShieldCheck } from 'lucide-react'
import { login, register } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'

const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
})

const registerSchema = loginSchema.extend({
  email: z.string().email('Correo inválido'),
  userName: z.string().min(3, 'Mínimo 3 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export function AuthScreen() {
  const [emailSent, setEmailSent] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const isLoginLoading = loginForm.formState.isSubmitting
  const isRegisterLoading = registerForm.formState.isSubmitting

  async function onLogin(data: LoginForm) {
    setError(null)
    try {
      await login(data.email)
      setEmailSent(data.email)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión')
    }
  }

  async function onRegister(data: RegisterForm) {
    setError(null)
    try {
      await register(data.userName, data.email)
      setEmailSent(data.email)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al registrarse')
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#f4f5f7]">
      {/* Background Patterns */}
      <div className="absolute inset-0 fwc-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 mb-12"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-primary blur-3xl opacity-10 animate-pulse" />
            <img
              src="/logoWC.svg"
              alt="Logo Quiniela"
              className="relative z-10 w-28 h-28 object-contain"
            />
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="font-display text-6xl tracking-tight text-foreground leading-[0.9]">
              QUINIELA
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary/30" />
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary">
                FIFA WORLD CUP 2026
              </span>
              <div className="h-px w-8 bg-primary/30" />
            </div>
          </div>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white p-2 shadow-2xl shadow-primary/5">
            {/* Tab Switcher */}
            <div className="flex p-1 gap-1 bg-secondary/50 rounded-[24px] mb-6">
              <button
                onClick={() => { setMode('login'); setError(null) }}
                className={`flex-1 py-3 rounded-[20px] text-[11px] font-bold tracking-widest uppercase transition-all duration-300 ${mode === 'login'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Ingresar
              </button>
              <button
                onClick={() => { setMode('register'); setError(null) }}
                className={`flex-1 py-3 rounded-[20px] text-[11px] font-bold tracking-widest uppercase transition-all duration-300 ${mode === 'register'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Unirse
              </button>
            </div>

            <div className="px-4 pb-6 pt-2">
              <AnimatePresence mode="wait">
                {emailSent ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col items-center text-center py-4"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">¡Revisá tu mail!</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Enviamos un enlace mágico a <br />
                      <span className="font-bold text-foreground">{emailSent}</span>
                    </p>
                    <button
                      onClick={() => setEmailSent(null)}
                      className="mt-6 text-xs font-bold text-primary uppercase tracking-widest hover:underline"
                    >
                      Intentar con otro correo
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: mode === 'login' ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === 'login' ? 10 : -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form
                      onSubmit={mode === 'login'
                        ? loginForm.handleSubmit(onLogin)
                        : registerForm.handleSubmit(onRegister)
                      }
                      className="flex flex-col gap-4"
                    >
                      {mode === 'register' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                            Tu Nombre / Nickname
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              {...registerForm.register('userName')}
                              type="text"
                              placeholder="Ej: ElDiez10"
                              className="w-full rounded-2xl pl-11 pr-4 py-4 text-sm font-medium border-border bg-secondary/30 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                            />
                          </div>
                          {registerForm.formState.errors.userName && (
                            <p className="text-[10px] font-bold text-destructive ml-1">
                              {registerForm.formState.errors.userName.message}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                          Correo electrónico
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            {...(mode === 'login' ? loginForm.register('email') : registerForm.register('email'))}
                            type="email"
                            placeholder="tu@email.com"
                            className="w-full rounded-2xl pl-11 pr-4 py-4 text-sm font-medium border-border bg-secondary/30 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                          />
                        </div>
                        {((mode === 'login' ? loginForm : registerForm).formState.errors.email) && (
                          <p className="text-[10px] font-bold text-destructive ml-1">
                            {(mode === 'login' ? loginForm : registerForm).formState.errors.email?.message}
                          </p>
                        )}
                      </div>

                      {error && (
                        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold text-center">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoginLoading || isRegisterLoading}
                        className="mt-2 w-full py-4 rounded-2xl font-display text-2xl tracking-tight text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group"
                        style={{ background: 'var(--gradient-primary)' }}
                      >
                        {(isLoginLoading || isRegisterLoading) ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <>
                            {mode === 'login' ? 'ENTRAR A LA CANCHA' : 'REGISTRARSE'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-col items-center gap-4 text-center"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/50 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Acceso seguro sin contraseña
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground max-w-[200px] leading-relaxed">
            Al ingresar aceptás las reglas de la quiniela y el fair play.
          </p>
        </motion.div>
      </main>

      {/* Decorative large "26" */}
      <div className="absolute -bottom-20 -right-20 font-display text-[25rem] text-primary/5 select-none pointer-events-none leading-none">
        26
      </div>
    </div>
  )
}
