import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Spinner } from '../components/shared'

// ─── Forgot Password ──────────────────────────────────────────────────────────
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return
    setLoading(true)
    setTimeout(() => { setSent(true); setLoading(false) }, 1500)
  }

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center px-8 uppercase font-sans">
      <div className="w-full max-w-sm">
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-12">
            <img src="/logo.svg" alt="EliteReserve" className="h-10 w-auto" />
            <span className="text-xs font-bold tracking-[0.3em] text-white/60">ELITERESERVE</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-[0.15em] leading-tight mb-4">
            RESET ACCESS KEY
          </h1>
          <p className="text-white/30 text-[10px] tracking-[0.2em] leading-loose">
            ENTER YOUR AUTHORIZATION EMAIL AND WE WILL DISPATCH RECOVERY INSTRUCTIONS.
          </p>
        </div>

        {sent ? (
          <div className="space-y-8">
            <div className="border border-status-success/30 p-8 text-center space-y-4">
              <span className="material-symbols-outlined text-status-success text-4xl block">mark_email_read</span>
              <p className="text-xs font-bold text-white tracking-widest">TRANSMISSION SENT</p>
              <p className="text-[9px] text-white/40 tracking-[0.2em] leading-loose">
                CHECK <span className="text-white">{email}</span> FOR RECOVERY INSTRUCTIONS.
              </p>
            </div>
            <Link to="/login" className="btn-ghost w-full text-center block">
              RETURN TO LOGIN
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <label className="block text-[9px] font-bold text-white/40 mb-4 uppercase tracking-[0.25em]">
                AUTHORIZATION EMAIL
              </label>
              <input
                type="email"
                className="w-full bg-transparent border-b border-white/10 focus:border-accent text-xs text-white placeholder:text-white/15 py-4 transition-all outline-none uppercase tracking-[0.2em]"
                placeholder="ENTER EMAIL"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4d9bff] text-black border border-[#4d9bff] hover:bg-[#7bb8ff] hover:border-[#7bb8ff] py-4 uppercase tracking-[0.3em] text-[10px] font-bold transition-all flex justify-center items-center gap-3"
              >
                {loading ? <Spinner size="sm" /> : 'DISPATCH RECOVERY LINK'}
              </button>
              <Link
                to="/login"
                className="block w-full text-center border border-white/40 text-white/80 hover:text-white hover:border-white py-3 text-[9px] font-bold tracking-[0.3em] transition-colors"
              >
                RETURN TO LOGIN
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── 404 Not Found ────────────────────────────────────────────────────────────
export function NotFoundPage() {
  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center px-8 uppercase font-sans text-center">
      <div className="space-y-8 max-w-md">
        <div className="text-[120px] md:text-[180px] font-bold text-white/5 leading-none select-none">
          404
        </div>
        <div className="-mt-8 space-y-4">
          <h1 className="text-2xl font-bold text-white tracking-[0.15em]">SECTOR NOT FOUND</h1>
          <p className="text-[10px] text-white/30 tracking-[0.2em] leading-loose">
            THE COORDINATES YOU ENTERED DO NOT MATCH ANY KNOWN SECTOR.
          </p>
        </div>
        <div className="flex gap-4 justify-center pt-4">
          <Link to="/dashboard" className="btn-ghost">
            RETURN TO BASE
          </Link>
          <Link
            to="/facilities"
            className="px-6 py-4 border border-white/40 text-white/80 hover:text-white hover:border-white text-[10px] font-bold tracking-widest transition-colors"
          >
            EXPLORE VENUES
          </Link>
        </div>
      </div>
    </div>
  )
}
