import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { authApi } from '../services'
import { useAuthStore } from '../store/authStore'
import { Spinner } from '../components/shared'

// ─── Login ───────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('INVALID EMAIL ADDRESS'),
  password: z.string().min(6, 'PASSWORD MUST BE AT LEAST 6 CHARACTERS'),
})
type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })
  const [showAdminPin, setShowAdminPin] = useState(false)
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [pinError, setPinError] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)

  const ADMIN_PIN = '141120'

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await authApi.login(data.email, data.password)
      login(res.data)
      navigate(res.data.role === 'Admin' ? '/admin' : '/dashboard')
    } catch {
      toast.error('ACCESS DENIED. INVALID CREDENTIALS.')
    }
  }

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (value && !/^\d$/.test(value)) return
    setPinError(false)
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    if (value && index < 5) {
      const next = document.getElementById(`pin-${index + 1}`)
      next?.focus()
    }

    if (newPin.every(d => d !== '') && newPin.join('').length === 6) {
      setTimeout(() => attemptAdminLogin(newPin.join('')), 200)
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prev = document.getElementById(`pin-${index - 1}`)
      prev?.focus()
    }
  }

  const attemptAdminLogin = async (code: string) => {
    if (code !== ADMIN_PIN) {
      setPinError(true)
      setPin(['', '', '', '', '', ''])
      document.getElementById('pin-0')?.focus()
      return
    }
    try {
      setAdminLoading(true)
      const res = await authApi.login('admin@sportbooking.com', 'Admin@123')
      login(res.data)
      navigate('/admin')
    } catch {
      setPinError(true)
      setPin(['', '', '', '', '', ''])
    } finally {
      setAdminLoading(false)
    }
  }

  return (
    <AuthLayout title="SYSTEM LOGIN" subtitle="ENTER YOUR CREDENTIALS TO ACCESS THE ELITERESERVE COMMAND CENTER." image="/assets/pexels-photo-841130.webp">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 w-full">
        <div>
          <label className="block text-[9px] font-bold text-white/40 mb-4 uppercase tracking-[0.25em]">AUTHORIZATION EMAIL</label>
          <input type="email" {...register('email')} className="w-full bg-transparent border-b border-white/10 focus:border-accent text-xs text-white placeholder:text-white/15 py-4 transition-all outline-none uppercase tracking-[0.2em]" placeholder="ENTER EMAIL" />
          {errors.email && <p className="text-red-500 text-[9px] mt-3 uppercase tracking-[0.2em]">{errors.email.message}</p>}
        </div>
        <div>
          <div className="flex justify-between mb-4">
            <label className="block text-[9px] font-bold text-white/40 uppercase tracking-[0.25em]">SECURE PASSKEY</label>
            <Link to="/forgot-password" className="text-[9px] text-white/70 hover:text-white uppercase tracking-[0.2em] transition-colors">FORGOT KEY?</Link>
          </div>
          <input type="password" {...register('password')} className="w-full bg-transparent border-b border-white/10 focus:border-accent text-xs text-white placeholder:text-white/15 py-4 transition-all outline-none uppercase tracking-[0.2em]" placeholder="ENTER PASSKEY" />
          {errors.password && <p className="text-red-500 text-[9px] mt-3 uppercase tracking-[0.2em]">{errors.password.message}</p>}
        </div>
        
        <div className="pt-10 space-y-4">
          <button type="submit" disabled={isSubmitting} className="w-full bg-[#4d9bff] text-black border border-[#4d9bff] hover:bg-[#7bb8ff] hover:border-[#7bb8ff] py-4 uppercase tracking-[0.3em] text-[10px] font-bold transition-all flex justify-center items-center gap-3">
            {isSubmitting ? <Spinner size="sm" /> : 'AUTHORIZE ACCESS'}
          </button>
          <button type="button" onClick={() => { setShowAdminPin(true); setTimeout(() => document.getElementById('pin-0')?.focus(), 100) }}
            className="w-full border border-white/40 text-white/80 hover:text-accent hover:border-accent/40 py-3 uppercase tracking-[0.3em] text-[9px] font-bold transition-all">
            ADMIN ACCESS
          </button>
        </div>

        <p className="text-left text-[9px] text-white/60 pt-8 tracking-[0.2em] uppercase">
          NO CLEARANCE? <Link to="/register" className="text-white/90 font-bold hover:text-white transition-colors ml-3">REQUEST ACCESS</Link>
        </p>
      </form>

      {/* Admin PIN Overlay */}
      {showAdminPin && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => { setShowAdminPin(false); setPin(['', '', '', '', '', '']); setPinError(false) }}>
          <div className="text-center space-y-12" onClick={e => e.stopPropagation()}>
            <div>
              <div className="w-10 h-10 border border-white/30 flex items-center justify-center mx-auto mb-8">
                <span className="material-symbols-outlined text-white/60 text-lg">lock</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-[0.2em] uppercase mb-4">ADMIN VERIFICATION</h2>
              <p className="text-[9px] text-white/30 tracking-[0.2em] uppercase">ENTER 6-DIGIT SECURITY CODE</p>
            </div>

            <div className="flex gap-3 justify-center">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  id={`pin-${i}`}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handlePinChange(i, e.target.value)}
                  onKeyDown={e => handlePinKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-lg font-bold bg-transparent border-b-2 outline-none transition-all uppercase ${
                    pinError ? 'border-red-500 text-red-500' : digit ? 'border-accent text-accent' : 'border-white/15 text-white'
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <p className="text-red-500 text-[9px] tracking-[0.2em] uppercase font-bold">INVALID CODE. ACCESS DENIED.</p>
            )}
            {adminLoading && (
              <div className="flex justify-center"><Spinner size="sm" /></div>
            )}

            <button onClick={() => { setShowAdminPin(false); setPin(['', '', '', '', '', '']); setPinError(false) }}
              className="text-[9px] text-white/60 hover:text-white tracking-[0.2em] uppercase transition-colors">
              CANCEL
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  )
}

// ─── Register ─────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  fullName: z.string().min(2, 'NAME MUST BE AT LEAST 2 CHARACTERS'),
  email: z.string().email('INVALID EMAIL ADDRESS'),
  phone: z.string().min(10, 'INVALID COMMUNICATION LINK'),
  password: z.string().min(6, 'PASSWORD MUST BE AT LEAST 6 CHARACTERS'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'PASSKEYS DO NOT MATCH', path: ['confirmPassword'] })
type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await authApi.register({ fullName: data.fullName, email: data.email, password: data.password, phone: data.phone })
      login(res.data)
      navigate('/dashboard')
    } catch {
      toast.error('IDENTITY ALREADY REGISTERED')
    }
  }

  return (
    <AuthLayout title="REQUEST CLEARANCE" subtitle="SUBMIT YOUR INFORMATION TO JOIN THE EXCLUSIVE ELITERESERVE NETWORK." image="/assets/pexels-photo-274506.webp">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
        {[
          { name: 'fullName' as const, label: 'FULL NAME', type: 'text', placeholder: 'ENTER NAME' },
          { name: 'email' as const, label: 'EMAIL', type: 'email', placeholder: 'ENTER EMAIL' },
          { name: 'phone' as const, label: 'PHONE', type: 'tel', placeholder: 'ENTER PHONE' },
          { name: 'password' as const, label: 'PASSKEY', type: 'password', placeholder: 'ENTER PASSKEY' },
          { name: 'confirmPassword' as const, label: 'VERIFY PASSKEY', type: 'password', placeholder: 'CONFIRM PASSKEY' },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-[9px] font-bold text-white/40 mb-4 uppercase tracking-[0.25em]">{f.label}</label>
            <input type={f.type} {...register(f.name)} className="w-full bg-transparent border-b border-white/15 focus:border-white text-xs text-white placeholder:text-white/15 py-4 transition-all outline-none uppercase tracking-[0.2em]" placeholder={f.placeholder} />
            {errors[f.name] && <p className="text-red-500 text-[9px] mt-3 uppercase tracking-[0.2em]">{errors[f.name]?.message}</p>}
          </div>
        ))}
        
        <div className="pt-10">
          <button type="submit" disabled={isSubmitting} className="w-full bg-[#4d9bff] text-black border border-[#4d9bff] hover:bg-[#7bb8ff] hover:border-[#7bb8ff] py-4 uppercase tracking-[0.3em] text-[10px] font-bold transition-all flex justify-center items-center gap-3">
            {isSubmitting ? <Spinner size="sm" /> : 'SUBMIT REQUEST'}
          </button>
        </div>
        
        <p className="text-left text-[9px] text-white/60 pt-8 tracking-[0.2em] uppercase">
          ALREADY APPROVED? <Link to="/login" className="text-white/90 font-bold hover:text-white transition-colors ml-3">SIGN IN</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

// ─── Auth Layout ──────────────────────────────────────────────────────────────
function AuthLayout({ title, subtitle, children, image }: { title: string; subtitle: string; children: React.ReactNode, image: string }) {
  return (
    <div className="w-full min-h-screen flex bg-black font-sans uppercase">
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10 py-20 lg:py-0">
        <div className="absolute top-12 left-8 sm:left-16 md:left-24 xl:left-32">
          <div className="flex items-center gap-4">
             <img src="/logo.svg" alt="EliteReserve" className="h-12 w-auto" />
             <span className="text-xs font-bold tracking-[0.3em] text-white/80">ELITERESERVE</span>
          </div>
        </div>
        
        <div className="w-full max-w-md mt-16 pt-[15px]">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-8 tracking-[0.15em] leading-relaxed">{title}</h1>
          <p className="text-white/35 tracking-[0.2em] text-[10px] mb-16 leading-loose">{subtitle}</p>
          {children}
        </div>
      </div>

      {/* Right side: Imagery */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <img 
          src={image} 
          alt="EliteReserve Asset" 
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 scale-105"
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 border-l border-white/10" />
      </div>
    </div>
  )
}
