'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail } from 'lucide-react'
import { login, register } from '@/lib/api'

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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al registrarse')
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#f4f5f7' }}
    >
      {/* Hero Header */}
      <div
        className="relative flex flex-col items-center justify-end pt-16 pb-12 px-6 overflow-hidden rounded-b-[40px] shadow-sm z-10"
        style={{
          background: '#ffffff',
          minHeight: '40vh',
          borderBottom: '4px solid #e8003d',
        }}
      >
        <div
          className="absolute right-[-24px] bottom-[-20px] select-none pointer-events-none opacity-[0.03]"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18rem',
            color: '#111827',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          26
        </div>

        <div className="relative flex flex-col items-center gap-5 z-10">
          {/* Trophy badge */}
          <div
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center bg-[#e8003d] shadow-[0_4px_20px_rgba(232,0,61,0.4)]"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <h1
              className="tracking-[0.2em] leading-none"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.8rem',
                color: '#111827',
              }}
            >
              QUINIELA
            </h1>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6" style={{ background: '#e8003d' }} />
              <p
                className="text-[10px] font-bold tracking-[0.25em] uppercase"
                style={{ color: '#e8003d' }}
              >
                FIFA WORLD CUP 2026
              </p>
              <div className="h-0.5 w-6" style={{ background: '#e8003d' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Form area */}
      <div className="flex-1 flex flex-col items-center px-6 pt-8 pb-10">
        
        {/* Tab switcher */}
        <div
          className="w-full max-w-sm rounded-[14px] p-1 flex mb-8 bg-gray-100 border border-gray-200"
        >
          <button
            onClick={() => { setMode('login'); setError(null) }}
            className="flex-1 py-2.5 rounded-[10px] text-[11px] font-bold tracking-widest uppercase transition-all duration-200"
            style={
              mode === 'login'
                ? { background: '#ffffff', color: '#111827', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
                : { color: '#6b7280' }
            }
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setMode('register'); setError(null) }}
            className="flex-1 py-2.5 rounded-[10px] text-[11px] font-bold tracking-widest uppercase transition-all duration-200"
            style={
              mode === 'register'
                ? { background: '#ffffff', color: '#111827', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
                : { color: '#6b7280' }
            }
          >
            Registrarse
          </button>
        </div>

        {/* Email enviado */}
        {emailSent && (
          <div className="w-full max-w-sm rounded-2xl px-5 py-4 mb-6 flex items-start gap-4 bg-green-50 border border-green-200 shadow-sm">
            <Mail className="w-6 h-6 mt-0.5 shrink-0 text-green-600" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-green-800">
                ¡Revisá tu correo!
              </p>
              <p className="text-xs text-green-700/80 leading-relaxed">
                Enviamos un enlace a{' '}
                <span className="font-semibold text-green-900">{emailSent}</span>.
                Hacé click para entrar sin contraseña.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="w-full max-w-sm rounded-2xl px-4 py-3 mb-6 text-sm font-semibold bg-red-50 border border-red-200 text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form
            onSubmit={loginForm.handleSubmit(onLogin)}
            className="w-full max-w-sm flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                Correo electrónico
              </label>
              <input
                {...loginForm.register('email')}
                type="email"
                placeholder="ingresa@tucorreo.com"
                autoComplete="email"
                className="rounded-2xl px-4 py-4 text-gray-900 text-sm font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none transition shadow-sm bg-white border border-gray-200 focus:border-[#e8003d] focus:ring-4 focus:ring-red-500/10"
              />
              {loginForm.formState.errors.email && (
                <p className="text-xs font-semibold text-red-500 ml-1">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoginLoading}
              className="mt-4 font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-transform uppercase tracking-widest shadow-[0_6px_20px_rgba(232,0,61,0.3)] bg-[linear-gradient(135deg,#e8003d,#c4003a)] text-white"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}
            >
              {isLoginLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              ENTRAR
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form
            onSubmit={registerForm.handleSubmit(onRegister)}
            className="w-full max-w-sm flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                Nombre de usuario
              </label>
              <input
                {...registerForm.register('userName')}
                type="text"
                placeholder="Ej. JuanPerez"
                autoComplete="username"
                className="rounded-2xl px-4 py-4 text-gray-900 text-sm font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none transition shadow-sm bg-white border border-gray-200 focus:border-[#e8003d] focus:ring-4 focus:ring-red-500/10"
              />
              {registerForm.formState.errors.userName && (
                <p className="text-xs font-semibold text-red-500 ml-1">
                  {registerForm.formState.errors.userName.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                Correo electrónico
              </label>
              <input
                {...registerForm.register('email')}
                type="email"
                placeholder="ingresa@tucorreo.com"
                autoComplete="email"
                className="rounded-2xl px-4 py-4 text-gray-900 text-sm font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none transition shadow-sm bg-white border border-gray-200 focus:border-[#e8003d] focus:ring-4 focus:ring-red-500/10"
              />
              {registerForm.formState.errors.email && (
                <p className="text-xs font-semibold text-red-500 ml-1">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isRegisterLoading}
              className="mt-4 font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-transform uppercase tracking-widest shadow-[0_6px_20px_rgba(232,0,61,0.3)] bg-[linear-gradient(135deg,#e8003d,#c4003a)] text-white"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}
            >
              {isRegisterLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              CREAR CUENTA
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
