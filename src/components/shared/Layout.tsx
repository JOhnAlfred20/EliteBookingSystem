import { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { useAuthStore } from '../../store/authStore'

function NavItem({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={clsx(
        'text-[11px] font-bold tracking-[0.2em] uppercase transition-all relative',
        active ? 'text-accent' : 'text-white/50 hover:text-white'
      )}
    >
      {label}
      {active && (
        <span className="absolute -bottom-1 left-0 w-full h-px bg-accent" />
      )}
    </Link>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [mobileMenuOpen])

  const handleLogout = () => { logout(); navigate('/login') }

  const adminNav = [
    { to: '/admin', label: 'Command Center' },
    { to: '/admin/bookings', label: 'Reservations' },
    { to: '/admin/facilities', label: 'Facilities' },
    { to: '/admin/users', label: 'Members' },
    { to: '/admin/reports', label: 'Financials' },
    { to: '/notifications', label: 'Alerts' },
    { to: '/profile', label: 'Profile' },
  ]
  const userNav = [
    { to: '/dashboard', label: 'Overview' },
    { to: '/facilities', label: 'Facilities' },
    { to: '/bookings', label: 'My Schedule' },
    { to: '/notifications', label: 'Alerts' },
    { to: '/profile', label: 'Profile' },
  ]
  const navItems = isAdmin() ? adminNav : userNav

  return (
    <div className="min-h-screen bg-black text-white font-sans uppercase">
      {/* Header */}
      <header className={clsx(
        'fixed top-0 w-full z-50 transition-all duration-500',
        scrolled
          ? 'bg-black/90 backdrop-blur-md border-b border-ghost-border py-4'
          : 'bg-transparent py-6'
      )}>
        <div className="w-full px-8 md:px-12 flex justify-between items-center">
          {/* Logo */}
          <Link
            to={isAdmin() ? '/admin' : '/dashboard'}
            className="flex items-center gap-4"
          >
            <img src="/logo.svg" alt="EliteReserve" className="h-10 w-auto" />
            <span className="text-sm font-bold tracking-[0.25em] text-white">ELITERESERVE</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navItems.map(n => (
              <NavItem
                key={n.to}
                to={n.to}
                label={n.label}
                active={pathname === n.to || (n.to !== '/dashboard' && n.to !== '/admin' && pathname.startsWith(n.to))}
              />
            ))}
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={handleLogout}
              className="text-[11px] font-bold text-white/40 tracking-[0.2em] uppercase hover:text-status-danger transition-colors"
            >
              SIGN OUT
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/60 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={clsx(
        'fixed inset-0 z-40 bg-black flex flex-col justify-start px-12 py-24 overflow-y-auto transition-all duration-300',
        mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}>
        <div className="flex items-center gap-4 mb-16 shrink-0">
          <img src="/logo.svg" alt="EliteReserve" className="h-10 w-auto" />
          <span className="text-sm font-bold tracking-[0.25em] text-white">ELITERESERVE</span>
        </div>
        <div className="flex flex-col gap-8 shrink-0">
          {navItems.map(n => (
            <Link
              key={n.to}
              to={n.to}
              className={clsx(
                'text-2xl sm:text-3xl font-bold tracking-wide transition-colors',
                pathname === n.to ? 'text-accent' : 'text-white/60 hover:text-white'
              )}
            >
              {n.label}
            </Link>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-bold tracking-widest text-white/30 text-left mt-16 hover:text-status-danger transition-colors shrink-0"
        >
          SIGN OUT
        </button>
      </div>

      {/* Main Content */}
      <main className="w-full min-h-screen">
        {children}
      </main>
    </div>
  )
}
