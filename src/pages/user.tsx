import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { bookingApi, facilityApi, paymentApi, authApi, notificationApi } from '../services'
import { useAuthStore } from '../store/authStore'
import { 
  Spinner, 
  EmptyState, 
  StatusBadge, 
  Pagination, 
  StatCard, 
  Modal, 
  ConfirmDialog, 
  facilityTypeLabel, 
  AnimatedPage, 
  PageLoader,
  getImage,
  SmartAccessKey,
  FacilityMap
} from '../components/shared'
import { SkeletonCard, SkeletonBookingCard, SkeletonDashboard } from '../components/shared/Skeleton'
import TimeSlotGrid from '../components/shared/TimeSlotGrid'
import { ReviewsSection } from '../components/shared/Reviews'
import type { Facility, Booking } from '../types'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'

// ─── User Dashboard ───────────────────────────────────────────────────────────
export function UserDashboard() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings', 1],
    queryFn: () => bookingApi.getMy(1, 5).then(r => r.data),
  })

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[100vh] flex items-center bg-black overflow-hidden">
        <img 
          src={getImage('Tennis', 1)} 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="relative z-10 px-8 md:px-20 w-full max-w-[1500px] mx-auto mt-20">
          <p className="text-white text-sm md:text-lg tracking-widest font-bold mb-4 uppercase">Member Portal</p>
          <h1 className="text-5xl md:text-8xl font-bold font-bold text-white mb-8 tracking-wide leading-tight uppercase">
            Welcome Back<br/>{user?.fullName?.split(' ')[0]}
          </h1>
          <div className="flex flex-col sm:flex-row gap-6 mt-12">
            <Link to="/facilities" className="btn-ghost">Reserve Court</Link>
            <Link to="/bookings" className="btn-ghost text-white border-white/30 hover:border-white">My Schedule</Link>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="relative w-full h-[100vh] flex items-center bg-black overflow-hidden">
        <img 
          src={getImage('Football', 2)} 
          alt="Facilities" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative z-10 px-8 md:px-20 w-full max-w-[1500px] mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold font-bold text-white mb-6 uppercase tracking-wide">Featured Facilities</h2>
          <p className="text-white max-w-2xl text-lg mb-12 uppercase tracking-wide leading-relaxed">
            Discover our premium courts and fields. Engineered for performance, designed for excellence.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {['Tennis', 'Padel', 'Golf', 'Gym'].map(key => (
              <div key={key} className="flex flex-col text-white uppercase">
                <span className="font-bold text-2xl tracking-wide">{key}</span>
                <span className="text-sm tracking-widest opacity-60 mt-2">Explore {key}</span>
              </div>
            ))}
          </div>
          <Link to="/facilities" className="btn-ghost">View All Facilities</Link>
        </div>
      </section>

      {/* Recent Bookings Section */}
      <section className="relative w-full min-h-[100vh] flex items-center bg-black overflow-hidden py-32">
        <img 
          src={getImage('Gym', 3)} 
          alt="Activity" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/70" />
        
        <div className="relative z-10 px-8 md:px-20 w-full max-w-[1500px] mx-auto">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl md:text-6xl font-bold font-bold text-white uppercase tracking-wide">Recent Activity</h2>
            <Link to="/bookings" className="btn-ghost hidden sm:inline-block">View All</Link>
          </div>

          {isLoading ? <Spinner /> : data?.items.length === 0 ? (
            <div className="text-white text-xl uppercase tracking-widest">No upcoming reservations</div>
          ) : (
            <div className="space-y-4">
              {data?.items.map(b => (
                <div key={b.id} className="border-b border-ghost-border py-6 flex flex-col md:flex-row md:items-center justify-between text-white uppercase tracking-widest gap-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-2xl">{b.facilityName}</span>
                    <span className="text-sm opacity-60 mt-2">{format(new Date(b.bookingDate), 'MMM dd, yyyy')} | {b.startTime.slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xl">${b.totalAmount}</span>
                    <span className={`px-4 py-2 border text-xs font-bold ${b.status === 'Confirmed' ? 'border-white text-white' : 'border-white/30 text-white/50'}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// ─── Facilities List (User) ───────────────────────────────────────────────────
export function FacilitiesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['facilities-active'],
    queryFn: () => facilityApi.getAll(true).then(r => r.data),
  })
  const [type, setType] = useState<string>('')

  const types = React.useMemo(() => ['Football', 'Basketball', 'Tennis', 'Padel', 'Golf', 'Gym', 'Swimming'], [])
  const filtered = React.useMemo(() => data?.filter(f => (!type || f.type === type)) ?? [], [data, type])

  return (
    <div className="w-full">
      {/* Intro section */}
      <section className="relative w-full h-[50vh] flex items-end bg-black overflow-hidden pb-12">
        <img 
          src={getImage('Tennis', 0)} 
          alt="Facilities Hero" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          fetchpriority="high"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div className="relative z-10 px-8 md:px-20 w-full max-w-[1500px] mx-auto">
          <h1 className="text-5xl font-bold text-white uppercase tracking-wide">Facilities</h1>
          
          <div className="flex gap-8 overflow-x-auto pt-12 scrollbar-hide pb-2">
            <button onClick={() => setType('')}
              className={`text-[13px] font-bold uppercase tracking-wider transition-colors ${!type ? 'text-white' : 'text-white/70 hover:text-white/100'}`}>
              ALL VENUES
            </button>
            {types.map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`text-[13px] font-bold uppercase tracking-wider transition-colors ${type === t ? 'text-white' : 'text-white/70 hover:text-white/100'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Sections */}
      {isLoading ? <Spinner /> : filtered.map((f, i) => (
        <section key={f.id} className="relative w-full h-[100vh] flex items-center bg-black overflow-hidden border-t border-ghost-border">
          <img 
            src={f.imageUrl || getImage(f.type, f.id)} 
            alt={f.name} 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          
          <div className="relative z-10 px-8 md:px-20 w-full max-w-[1500px] mx-auto">
            <div className="max-w-3xl">
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 uppercase tracking-wide leading-none">{f.name}</h2>
              <p className="text-white/80 text-lg mb-8 uppercase tracking-widest leading-relaxed">
                {f.description}
              </p>
              <div className="flex gap-12 mb-12 uppercase tracking-widest text-sm text-white font-bold">
                <div className="flex flex-col">
                  <span className="opacity-60 mb-1 text-[10px]">TYPE</span>
                  <span className="text-xl">{f.type}</span>
                </div>
                <div className="flex flex-col">
                  <span className="opacity-60 mb-1 text-[10px]">CAPACITY</span>
                  <span className="text-xl">{f.capacity}</span>
                </div>
                <div className="flex flex-col">
                  <span className="opacity-60 mb-1 text-[10px]">RATE</span>
                  <span className="text-xl">${f.pricePerHour}/HR</span>
                </div>
              </div>
              <Link to={`/facilities/${f.id}/book`} className="btn-ghost">
                RESERVE TIME
              </Link>
            </div>
          </div>
        </section>
      ))}
      
      {!isLoading && filtered.length === 0 && (
        <div className="h-[50vh] flex items-center justify-center text-white/50 uppercase tracking-widest font-bold">
          NO FACILITIES MATCHING CRITERIA
        </div>
      )}
    </div>
  )
}

// ───// ─── Booking Form ─────────────────────────────────────────────────────────────
export function BookingFormPage() {
  const navigate = useNavigate()
  const { id: idStr } = useParams<{ id: string }>()
  const id = parseInt(idStr!)
  const qc = useQueryClient()

  const { data: facility } = useQuery({
    queryKey: ['facility', id],
    queryFn: () => facilityApi.getById(id).then(r => r.data),
  })

  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  const { mutate, isPending } = useMutation({
    mutationFn: () => bookingApi.create({
      facilityId: id, bookingDate: date,
      startTime: startTime + ':00', endTime: endTime + ':00', notes
    }),
    onSuccess: () => {
      toast.success('RESERVATION SECURED')
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      navigate('/bookings')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'ERROR CREATING RESERVATION')
  })

  const hours = startTime && endTime ? Math.max(0, (parseInt(endTime.split(':')[0]) - parseInt(startTime.split(':')[0]))) : 0
  const total = hours * (facility?.pricePerHour ?? 0)

  return (
    <div className="relative w-full min-h-[100vh] flex flex-col justify-center bg-black overflow-hidden pt-32 pb-12 uppercase font-sans">
      <img 
        src={facility?.imageUrl || getImage(facility?.type ?? 'Football', id)} 
        alt={facility?.name} 
        className="absolute inset-0 w-full h-full object-cover opacity-40 fixed"
        fetchpriority="high"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent fixed" />
      
      <div className="relative z-10 w-full px-8 md:px-20 max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Info */}
        <div className="space-y-8">
          <div>
            <button onClick={() => navigate(-1)} className="text-[10px] font-bold text-white/60 hover:text-white uppercase tracking-widest mb-8 flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-[14px]">arrow_back</span> RETURN TO VENUES
            </button>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 uppercase tracking-wide leading-none">{facility?.name || 'LOADING...'}</h1>
            <p className="text-white/80 text-lg uppercase tracking-widest leading-relaxed">
              {facility?.description}
            </p>
          </div>
          
          <div className="flex gap-12 uppercase tracking-widest text-sm text-white font-bold border-y border-ghost-border py-6">
            <div className="flex flex-col">
              <span className="opacity-60 mb-1 text-[10px]">RATE</span>
              <span className="text-xl">${facility?.pricePerHour}/HR</span>
            </div>
            <div className="flex flex-col">
              <span className="opacity-60 mb-1 text-[10px]">CAPACITY</span>
              <span className="text-xl">{facility?.capacity}</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="bg-ghost-surface border border-ghost-border p-8 md:p-12 space-y-8 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-white uppercase tracking-wide">SECURE SESSION</h2>
          
          <div>
            <label className="block text-[10px] font-bold text-white/60 mb-3 uppercase tracking-widest">RESERVATION DATE</label>
            <input type="date" className="w-full bg-black/50 border border-ghost-border focus:border-white text-white p-4 transition-all outline-none uppercase tracking-widest" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-white/60 mb-3 uppercase tracking-widest">START TIME</label>
              <input type="time" className="w-full bg-black/50 border border-ghost-border focus:border-white text-white p-4 transition-all outline-none uppercase tracking-widest" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/60 mb-3 uppercase tracking-widest">END TIME</label>
              <input type="time" className="w-full bg-black/50 border border-ghost-border focus:border-white text-white p-4 transition-all outline-none uppercase tracking-widest" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-white/60 mb-3 uppercase tracking-widest">SPECIAL REQUESTS</label>
            <textarea className="w-full bg-black/50 border border-ghost-border focus:border-white text-white p-4 transition-all outline-none resize-none uppercase tracking-widest" rows={3} placeholder="EQUIPMENT NEEDS..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div className="pt-6 border-t border-ghost-border flex items-end justify-between">
            <div>
              <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold block mb-1">TOTAL INVESTMENT ({hours} HRS)</span>
              <span className="text-4xl font-bold text-white tracking-wide">${Math.max(0, total - discount)}</span>
            </div>
            <button className="btn-ghost" disabled={!date || !startTime || !endTime || isPending} onClick={() => mutate()}>
              {isPending ? <Spinner size="sm" /> : 'CONFIRM'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── My Bookings ──────────────────────────────────────────────────────────────
export function MyBookingsPage() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings', page],
    queryFn: () => bookingApi.getMy(page, 10).then(r => r.data),
  })

  const { mutate: cancel } = useMutation({
    mutationFn: (id: number) => bookingApi.updateStatus(id, 'Cancelled'),
    onSuccess: () => { toast.success('RESERVATION CANCELLED'); qc.invalidateQueries({ queryKey: ['my-bookings'] }) },
    onError: () => toast.error('CANNOT CANCEL RESERVATION')
  })

  const [cancelId, setCancelId] = useState<number | null>(null)

  return (
    <div className="w-full min-h-[100vh] bg-black pt-32 pb-20 px-8 md:px-20 uppercase font-sans">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex items-end justify-between mb-16 border-b border-ghost-border pb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-wide leading-none">MY SCHEDULE</h1>
          <Link to="/facilities" className="btn-ghost hidden md:inline-block">NEW BOOKING</Link>
        </div>
        
        {isLoading ? <Spinner /> : data?.items.length === 0 ? (
          <div className="text-white/60 text-xl tracking-widest">NO UPCOMING SESSIONS</div>
        ) : (
          <div className="flex flex-col">
            {data?.items.map(b => (
              <BookingCard key={b.id} booking={b} onCancel={b.status !== 'Cancelled' && b.status !== 'Completed' ? () => setCancelId(b.id) : undefined} />
            ))}
            {data && <Pagination page={page} total={data.total} pageSize={10} onChange={setPage} />}
          </div>
        )}
        <ConfirmDialog open={cancelId !== null} onClose={() => setCancelId(null)}
          onConfirm={() => cancelId && cancel(cancelId)}
          title="CANCEL RESERVATION" message="ARE YOU SURE YOU WANT TO FORFEIT THIS TIME SLOT?" danger />
      </div>
    </div>
  )
}

// ─── Booking Card ─────────────────────────────────────────────────────────────
export function BookingCard({ booking: b, compact = false, onCancel, adminActions }: {
  booking: Booking; compact?: boolean; onCancel?: () => void;
  adminActions?: { onConfirm?: () => void; onComplete?: () => void }
}) {
  const [showSmartKey, setShowSmartKey] = useState(false)

  return (
    <div className="border-b border-ghost-border py-8 flex flex-col md:flex-row md:items-center justify-between text-white tracking-widest gap-8 transition-colors hover:bg-white/5 px-6 -mx-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="font-bold text-3xl">{b.facilityName}</span>
          <span className={`px-3 py-1 border text-[10px] font-bold ${b.status === 'Confirmed' ? 'border-white text-white' : 'border-white/30 text-white/50'}`}>
            {b.status}
          </span>
        </div>
        {!compact && <p className="text-sm opacity-60">MEMBER: <span className="text-white opacity-100">{b.userName}</span></p>}
        <div className="flex items-center gap-8 text-sm opacity-80 flex-wrap">
          <span>DATE: {format(new Date(b.bookingDate), 'MMM dd, yyyy')}</span>
          <span>TIME: {b.startTime.slice(0, 5)} - {b.endTime.slice(0, 5)}</span>
          <span className="font-bold">TOTAL: ${b.totalAmount}</span>
        </div>
      </div>
      
      <div className="flex gap-4 flex-wrap items-center">
        {b.status === 'Confirmed' && !b.payment && !adminActions && (
          <Link to={`/checkout/${b.id}`} className="btn-ghost !text-[10px] !py-3 !px-6">
            SETTLE BILL
          </Link>
        )}
        {onCancel && (
          <button onClick={onCancel} className="text-[10px] text-white/70 hover:text-white border border-white/40 hover:border-white px-6 py-3 rounded-full transition-all font-bold tracking-widest">
            CANCEL
          </button>
        )}
        {adminActions?.onConfirm && (
          <button onClick={adminActions.onConfirm} className="btn-ghost !text-[10px] !py-3 !px-6">APPROVE</button>
        )}
        {adminActions?.onComplete && (
          <button onClick={adminActions.onComplete} className="btn-ghost !text-[10px] !py-3 !px-6 border-white bg-white/10 text-white hover:bg-white hover:text-black">
            MARK COMPLETED
          </button>
        )}
        {b.status === 'Confirmed' && !adminActions && (
          <button onClick={() => setShowSmartKey(true)} className="btn-ghost !text-[10px] !py-3 !px-6 border-white text-white">
            DIGITAL KEY
          </button>
        )}
      </div>
      
      <SmartAccessKey open={showSmartKey} onClose={() => setShowSmartKey(false)} booking={{
        facilityName: b.facilityName, startTime: b.startTime, endTime: b.endTime, date: b.bookingDate, id: b.id
      }} />
    </div>
  )
}

// ─── Checkout Page ────────────────────────────────────────────────────────────
export function CheckoutPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [isPaying, setIsPaying] = useState(false)
  const [payMethod, setPayMethod] = useState<'Instapay' | 'VodafoneCash' | 'Cash' | null>(null)
  const [transactionId, setTransactionId] = useState('')

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingApi.getMy(1, 100).then(r => r.data.items.find(b => b.id === parseInt(bookingId!))),
  })

  const submitPayment = async () => {
    if (!booking) return
    if ((payMethod === 'Instapay' || payMethod === 'VodafoneCash') && !transactionId.trim()) {
      return toast.error('TRANSACTION ID REQUIRED')
    }
    try {
      setIsPaying(true)
      await paymentApi.create({ 
        bookingId: booking.id, 
        method: payMethod!, 
        transactionId: (payMethod === 'Instapay' || payMethod === 'VodafoneCash') ? transactionId : undefined 
      })
      toast.success('PAYMENT CONFIRMED')
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      navigate('/bookings')
    } catch {
      toast.error('ERROR PROCESSING TRANSACTION')
    } finally {
      setIsPaying(false)
    }
  }

  if (isLoading) return <div className="w-full h-[100vh] bg-black flex items-center justify-center text-white"><Spinner /></div>
  if (!booking) return <div className="w-full h-[100vh] bg-black flex items-center justify-center text-white uppercase tracking-widest">RESERVATION NOT FOUND</div>

  return (
    <div className="w-full min-h-[100vh] bg-black pt-32 pb-20 px-8 md:px-20 uppercase font-sans">
      <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Summary */}
        <div className="space-y-8">
          <button onClick={() => navigate(-1)} className="text-[10px] font-bold text-white/60 hover:text-white uppercase tracking-widest mb-8 flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span> RETURN TO SCHEDULE
          </button>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-wide leading-none mb-8">SETTLE<br/>INVOICE</h1>
          
          <div className="border-t border-ghost-border pt-8 space-y-6 text-white tracking-widest">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="opacity-60">FACILITY</span>
              <span>{booking.facilityName}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="opacity-60">DATE</span>
              <span>{format(new Date(booking.bookingDate), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="opacity-60">TIME</span>
              <span>{booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}</span>
            </div>
          </div>
          
          <div className="border-t border-ghost-border pt-8 mt-8 flex justify-between items-end">
            <span className="text-white/60 font-bold tracking-widest">TOTAL DUE</span>
            <span className="text-6xl font-bold text-white tracking-wide">${booking.totalAmount}</span>
          </div>
        </div>

        {/* Right: Payment Method */}
        <div className="bg-ghost-surface border border-ghost-border p-8 md:p-12 space-y-12">
          <h2 className="text-3xl font-bold text-white tracking-wide">PAYMENT METHOD</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['Instapay', 'VodafoneCash', 'Cash'].map(method => (
              <button key={method} onClick={() => setPayMethod(method as any)}
                className={`border p-6 font-bold tracking-widest transition-colors ${payMethod === method ? 'bg-white text-black border-white' : 'bg-transparent text-white/80 border-ghost-border hover:border-white hover:text-white'}`}>
                {method.toUpperCase()}
              </button>
            ))}
          </div>

          {(payMethod === 'Instapay' || payMethod === 'VodafoneCash') && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="p-8 border border-ghost-border flex flex-col items-center gap-6 text-center">
                <div className="w-48 h-48 bg-white p-2">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=000000&data=${payMethod === 'Instapay' ? 'admin@elitereserve' : '01000000000'}`} alt="Payment QR" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="text-white/60 tracking-widest mb-2 font-bold text-xs">OFFICIAL TRANSFER ADDRESS</p>
                  <p className="text-xl text-white font-bold tracking-widest">{payMethod === 'Instapay' ? 'ADMIN@ELITERESERVE' : '+1 555 000 0000'}</p>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/60 mb-3 uppercase tracking-widest">TRANSACTION REFERENCE ID</label>
                <input type="text" className="w-full bg-black/50 border border-ghost-border focus:border-white text-white p-4 transition-all outline-none tracking-widest uppercase" value={transactionId} onChange={e => setTransactionId(e.target.value)} />
              </div>
            </div>
          )}

          {payMethod === 'Cash' && (
            <div className="p-12 border border-ghost-border text-center space-y-6 animate-in fade-in duration-500">
              <span className="material-symbols-outlined text-6xl text-white">payments</span>
              <p className="text-white tracking-widest font-bold leading-relaxed">
                RESERVATION CONFIRMED.<br/>PLEASE SETTLE INVOICE WITH CONCIERGE UPON ARRIVAL.
              </p>
            </div>
          )}

          <div className="pt-8 border-t border-ghost-border">
            <button disabled={!payMethod || isPaying} onClick={submitPayment}
              className="btn-ghost w-full flex justify-center items-center gap-4">
              {isPaying ? <Spinner size="sm" /> : 'AUTHORIZE PAYMENT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Notifications Page ───────────────────────────────────────────────────────
export function NotificationsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll().then(r => r.data),
  })
  const { mutate: markAll } = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] })
  })

  return (
    <div className="w-full min-h-[100vh] bg-black pt-32 pb-20 px-8 md:px-20 uppercase font-sans">
      <div className="max-w-[1000px] mx-auto space-y-12">
        <div className="flex items-end justify-between border-b border-ghost-border pb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-wide leading-none">ALERTS</h1>
          <button onClick={() => markAll()} className="btn-ghost !text-[10px] !py-3 !px-6 hidden md:block">
            MARK ALL READ
          </button>
        </div>
        
        {isLoading ? <Spinner /> : data?.length === 0 ? (
          <div className="text-white/60 text-xl tracking-widest">NO NEW ALERTS</div>
        ) : (
          <div className="space-y-4 border-l border-ghost-border pl-8">
            {data?.map(n => (
              <div key={n.id} className={`py-8 border-b border-ghost-border transition-all ${!n.isRead ? 'opacity-100' : 'opacity-50'}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-white tracking-widest flex items-center gap-4">
                    {!n.isRead && <span className="w-3 h-3 bg-white rounded-full inline-block" />}
                    {n.title || 'SYSTEM ALERT'}
                  </h3>
                  <span className="text-xs text-white/60 tracking-widest font-bold">
                    {format(new Date(n.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                <p className="text-white/80 text-lg tracking-widest leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { data } = useQuery({ queryKey: ['profile'], queryFn: () => authApi.profile().then(r => r.data) })
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const qc = useQueryClient()

  const save = async () => {
    try {
      await authApi.updateProfile({ fullName: name || data?.fullName || '', phone: phone || data?.phone || '' })
      toast.success('PREFERENCES UPDATED')
      qc.invalidateQueries({ queryKey: ['profile'] })
    } catch {
      toast.error('UPDATE FAILED')
    }
  }

  return (
    <div className="w-full min-h-[100vh] bg-black pt-32 pb-20 px-8 md:px-20 uppercase font-sans">
      <div className="max-w-[1000px] mx-auto space-y-16">
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-wide leading-none border-b border-ghost-border pb-8">
          MEMBERSHIP PROFILE
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-12">
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 rounded-full border border-white flex items-center justify-center text-4xl font-bold text-white tracking-widest">
                {data?.fullName?.[0] ?? '?'}
              </div>
              <div>
                <p className="text-white/60 font-bold tracking-widest mb-2">ELITE MEMBER</p>
                <h2 className="text-3xl font-bold text-white tracking-wide">{data?.fullName}</h2>
              </div>
            </div>
            <div className="bg-ghost-surface border border-ghost-border p-8 text-white">
              <p className="text-white/60 font-bold tracking-widest text-xs mb-4">SECURITY CLEARANCE</p>
              <p className="text-2xl tracking-widest font-bold">LEVEL 4 APPROVED</p>
            </div>
          </div>

          <div className="space-y-8 bg-ghost-surface border border-ghost-border p-8 md:p-12">
            <h2 className="text-2xl font-bold text-white tracking-wide">SYSTEM PREFERENCES</h2>
            <div>
              <label className="block text-[10px] font-bold text-white/60 mb-3 uppercase tracking-widest">FULL NAME</label>
              <input className="w-full bg-black/50 border border-ghost-border focus:border-white text-white p-4 transition-all outline-none uppercase tracking-widest" defaultValue={data?.fullName} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/60 mb-3 uppercase tracking-widest">EMAIL ADDRESS (LOCKED)</label>
              <input className="w-full bg-black/50 border border-ghost-border text-white/50 p-4 outline-none uppercase tracking-widest cursor-not-allowed" value={data?.email ?? ''} disabled />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/60 mb-3 uppercase tracking-widest">PHONE NUMBER</label>
              <input className="w-full bg-black/50 border border-ghost-border focus:border-white text-white p-4 transition-all outline-none uppercase tracking-widest" defaultValue={data?.phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="pt-8">
              <button className="btn-ghost w-full" onClick={save}>
                SAVE PREFERENCES
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
