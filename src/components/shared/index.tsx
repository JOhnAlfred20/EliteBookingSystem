import { ReactNode } from 'react'
import { clsx } from 'clsx'
import { Loader2, X } from 'lucide-react'

// ─── Loading Spinner ─────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return <Loader2 className={clsx(s, 'animate-spin text-accent mx-auto')} />
}

// ─── Page Loader ─────────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Spinner size="lg" />
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ message = 'NO DATA AVAILABLE' }: { message?: string }) {
  return (
    <div className="text-center py-20 text-white/30 uppercase tracking-widest">
      <span className="material-symbols-outlined text-5xl mb-4 block opacity-20">inbox</span>
      <p className="text-xs font-bold">{message}</p>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Confirmed: 'border-status-success text-status-success',
    Pending:   'border-status-warning text-status-warning',
    Cancelled: 'border-status-danger text-status-danger',
    Completed: 'border-accent text-accent',
    Paid:      'border-status-success text-status-success',
    Failed:    'border-status-danger text-status-danger',
    Refunded:  'border-status-warning text-status-warning',
  }
  return (
    <span className={clsx(
      'px-2 py-1 border text-[9px] font-bold tracking-widest uppercase',
      styles[status] || 'border-white/30 text-white/60'
    )}>
      {status}
    </span>
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-2 w-full max-w-lg max-h-[90vh] overflow-y-auto z-10 border border-ghost-border">
        <div className="flex items-center justify-between p-6 border-b border-ghost-border">
          <h2 className="text-sm font-bold text-white tracking-widest uppercase">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border border-ghost-border hover:border-white transition-colors">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger = false }: {
  open: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string; danger?: boolean
}) {
  if (!open) return null
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-white/60 mb-8 text-xs tracking-widest leading-relaxed">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-6 py-3 border border-ghost-border text-white/60 hover:text-white hover:border-white text-[10px] font-bold uppercase tracking-widest transition-colors">
          CANCEL
        </button>
        <button
          onClick={() => { onConfirm(); onClose() }}
          className={clsx(
            'px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors',
            danger
              ? 'border border-status-danger text-status-danger hover:bg-status-danger hover:text-black'
              : 'bg-[#4d9bff] text-black hover:bg-[#7bb8ff]'
          )}>
          CONFIRM
        </button>
      </div>
    </Modal>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
export function StatCard({ title, value, icon, color = 'blue', sub }: {
  title: string; value: string | number; icon: ReactNode; color?: string; sub?: string
}) {
  const colors: Record<string, string> = {
    blue:   'text-accent',
    green:  'text-status-success',
    yellow: 'text-status-warning',
    red:    'text-status-danger',
    purple: 'text-purple-400',
  }
  return (
    <div className="border border-ghost-border bg-surface-1 p-6 flex items-center gap-4 hover:bg-surface-2 transition-colors">
      <div className={clsx('text-2xl', colors[color] || 'text-accent')}>{icon}</div>
      <div>
        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-[9px] text-white/40 mt-1 tracking-widest">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Pagination ──────────────────────────────────────────────────────────────
export function Pagination({ page, total, pageSize, onChange }: {
  page: number; total: number; pageSize: number; onChange: (p: number) => void
}) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-12 pt-8 border-t border-ghost-border text-xs uppercase tracking-widest">
      <span className="text-white/30 text-[9px]">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} OF {total}
      </span>
      <div className="flex gap-2">
        <button disabled={page === 1} onClick={() => onChange(page - 1)}
          className="px-5 py-2 border border-ghost-border text-white/40 hover:text-white hover:border-white disabled:opacity-20 transition-colors text-[9px] font-bold">
          PREV
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
          return (
            <button key={p} onClick={() => onChange(p)}
              className={clsx('px-4 py-2 text-[9px] font-bold transition-colors',
                p === page
                  ? 'bg-[#4d9bff] text-black border border-[#4d9bff]'
                  : 'border border-ghost-border text-white/40 hover:text-white hover:border-white')}>
              {p}
            </button>
          )
        })}
        <button disabled={page === totalPages} onClick={() => onChange(page + 1)}
          className="px-5 py-2 border border-ghost-border text-white/40 hover:text-white hover:border-white disabled:opacity-20 transition-colors text-[9px] font-bold">
          NEXT
        </button>
      </div>
    </div>
  )
}

// ─── Facility Type Labels ────────────────────────────────────────────────────
export const facilityTypeLabel: Record<string, string> = {
  Football: 'Football', Basketball: 'Basketball',
  Tennis: 'Tennis', Gym: 'Gym', Swimming: 'Swimming',
  Padel: 'Padel', Golf: 'Golf',
}

export { default as AnimatedPage, cn } from './AnimatedPage'

// ─── Image Selector ──────────────────────────────────────────────────────────
export function getImage(type: string, id: number) {
  const types: Record<string, string[]> = {
    Football: [
      '/assets/the-ball-stadion-football-the-pitch-46798.webp',
      '/assets/pexels-photo-3148452.webp'
    ],
    Basketball: [
      '/assets/pexels-photo-1752757.webp'
    ],
    Tennis: [
      '/assets/pexels-photo-1432039.webp',
      '/assets/pexels-photo-209977.webp'
    ],
    Gym: [
      '/assets/pexels-photo-1552242.webp',
      '/assets/pexels-photo-841130.webp'
    ],
    Swimming: [
      '/assets/pexels-photo-261185.webp'
    ],
    Padel: [
      '/assets/pexels-photo-1432039.webp'
    ],
    Golf: [
      '/assets/pexels-photo-274506.webp'
    ],
  }
  const imgs = types[type] || types.Football
  return imgs[id % imgs.length]
}

export * from './SmartAccessKey'
export * from './FacilityMap'
