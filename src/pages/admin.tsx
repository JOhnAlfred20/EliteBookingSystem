import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { bookingApi, facilityApi, reportApi, userApi } from '../services'
import { Spinner, EmptyState, Pagination, ConfirmDialog, Modal } from '../components/shared'
import { BookingCard } from './user'
import type { Facility } from '../types'
import { format } from 'date-fns'

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportApi.getDashboard().then(r => r.data),
  })

  if (isLoading) return <Spinner />

  const COLORS = ['#4d9bff', '#7bb8ff', '#34d399', '#fbbf24', '#f87171']

  return (
    <div className="w-full min-h-screen bg-black text-white px-8 md:px-20 pt-32 pb-20 uppercase font-sans">
      <div className="max-w-[1500px] mx-auto space-y-16">
        <div className="border-b border-ghost-border pb-8 flex items-end justify-between">
          <h1 className="text-5xl md:text-7xl font-bold tracking-wide leading-none">COMMAND CENTER</h1>
          <span className="text-accent text-[10px] tracking-widest font-bold">LIVE</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ghost-border">
          <div className="bg-surface-1 p-8 hover:bg-surface-2 transition-colors group">
            <span className="text-white/40 text-[9px] tracking-widest font-bold mb-3 block">RESERVATIONS</span>
            <span className="text-5xl font-bold text-white group-hover:text-accent transition-colors">{data?.totalBookings ?? 0}</span>
          </div>
          <div className="bg-surface-1 p-8 hover:bg-surface-2 transition-colors group">
            <span className="text-white/40 text-[9px] tracking-widest font-bold mb-3 block">TODAY'S SESSIONS</span>
            <span className="text-5xl font-bold text-status-success">{data?.todayBookings ?? 0}</span>
          </div>
          <div className="bg-surface-1 p-8 hover:bg-surface-2 transition-colors group">
            <span className="text-white/40 text-[9px] tracking-widest font-bold mb-3 block">ACTIVE MEMBERS</span>
            <span className="text-5xl font-bold text-white group-hover:text-accent transition-colors">{data?.totalUsers ?? 0}</span>
          </div>
          <div className="bg-surface-1 p-8 hover:bg-surface-2 transition-colors group">
            <span className="text-white/40 text-[9px] tracking-widest font-bold mb-3 block">MONTHLY REVENUE</span>
            <span className="text-5xl font-bold text-accent">${data?.monthRevenue ?? 0}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-surface-1 border border-ghost-border p-8">
            <h2 className="text-[11px] font-bold tracking-widest mb-8 text-white/60">REVENUE TRAJECTORY</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.monthlyRevenue ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip cursor={{ fill: 'rgba(77,155,255,0.05)' }} contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(77,155,255,0.2)', color: '#e8e8f0', fontSize: 10 }} />
                <Bar dataKey="revenue" fill="#4d9bff" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface-1 border border-ghost-border p-8">
            <h2 className="text-[11px] font-bold tracking-widest mb-8 text-white/60">FACILITY UTILIZATION</h2>
            {data?.facilityStats && data.facilityStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data.facilityStats} dataKey="totalBookings" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {data.facilityStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#000" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(77,155,255,0.2)', color: '#e8e8f0', fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState message="NO DATA" />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Admin Bookings ───────────────────────────────────────────────────────────
export function AdminBookings() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['all-bookings', page, statusFilter, viewMode],
    queryFn: () => bookingApi.getAll(viewMode === 'calendar' ? 1 : page, viewMode === 'calendar' ? 1000 : 10, statusFilter || undefined).then(r => r.data),
  })

  const calendarEvents = React.useMemo(() => data?.items.map(b => ({
    id: b.id.toString(),
    title: b.facilityName + ' | ' + b.userName,
    start: `${b.bookingDate.split('T')[0]}T${b.startTime}`,
    end: `${b.bookingDate.split('T')[0]}T${b.endTime}`,
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
    textColor: '#000000'
  })) || [], [data?.items])

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => bookingApi.updateStatus(id, status),
    onSuccess: () => { toast.success('STATUS UPDATED'); qc.invalidateQueries({ queryKey: ['all-bookings'] }) }
  })

  const exportExcel = () => {
    if (!data) return
    const ws = XLSX.utils.json_to_sheet(data.items.map(b => ({
      'Ref ID': b.id, 'Member': b.userName, 'Facility': b.facilityName,
      'Date': b.bookingDate, 'Start': b.startTime, 'End': b.endTime,
      'Amount': b.totalAmount, 'Status': b.status
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reservations')
    XLSX.writeFile(wb, 'reservations.xlsx')
    toast.success('EXPORT COMPLETE')
  }

  const exportPDF = () => {
    if (!data) return
    const doc = new jsPDF()
    doc.text('RESERVATIONS LOG', 10, 10)
    data.items.forEach((b, i) => {
      doc.text(`${i + 1}. ${b.facilityName} | ${b.userName} | ${b.bookingDate} | $${b.totalAmount} | ${b.status}`, 10, 20 + i * 8)
    })
    doc.save('reservations.pdf')
    toast.success('EXPORT COMPLETE')
  }

  return (
    <div className="w-full min-h-screen bg-black text-white px-8 md:px-20 pt-32 pb-20 uppercase font-sans">
      <div className="max-w-[1500px] mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-ghost-border pb-8 gap-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-wide leading-none">RESERVATIONS</h1>
          <div className="flex gap-4">
            <button onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')} className="btn-ghost !p-3">
              TOGGLE {viewMode === 'list' ? 'CALENDAR' : 'LIST'}
            </button>
            <button onClick={exportExcel} className="btn-ghost !p-3">EXCEL</button>
            <button onClick={exportPDF} className="btn-ghost !p-3">PDF</button>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4">
          {[{val: '', lbl: 'ALL'}, {val: 'Confirmed', lbl: 'CONFIRMED'}, {val: 'Pending', lbl: 'PENDING'}, {val: 'Cancelled', lbl: 'CANCELLED'}, {val: 'Completed', lbl: 'COMPLETED'}].map(s => (
            <button key={s.val} onClick={() => { setStatusFilter(s.val); setPage(1) }}
              className={`px-6 py-3 tracking-widest font-bold text-[10px] transition-all ${
                statusFilter === s.val
                  ? 'bg-[#4d9bff] text-black border border-[#4d9bff]'
                  : 'bg-transparent text-white/70 border border-ghost-border hover:border-[#4d9bff]/50 hover:text-[#4d9bff]'
              }`}>
              {s.lbl}
            </button>
          ))}
        </div>

        {isLoading ? <Spinner /> : data?.items.length === 0 ? <div className="text-white/60">NO RESERVATIONS</div> : viewMode === 'calendar' ? (
          <div className="border border-ghost-border p-8 h-[70vh]">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
              events={calendarEvents}
              height="100%"
              slotMinTime="06:00:00"
              slotMaxTime="24:00:00"
              allDaySlot={false}
            />
          </div>
        ) : (
          <div className="flex flex-col border-t border-ghost-border">
            {data?.items.map(b => (
              <BookingCard key={b.id} booking={b}
                adminActions={{
                  onConfirm: b.status === 'Pending' ? () => updateStatus({ id: b.id, status: 'Confirmed' }) : undefined,
                  onComplete: b.status === 'Confirmed' ? () => updateStatus({ id: b.id, status: 'Completed' }) : undefined,
                }} />
            ))}
            {data && <Pagination page={page} total={data.total} pageSize={10} onChange={setPage} />}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Admin Facilities ─────────────────────────────────────────────────────────
export function AdminFacilities() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Facility | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', description: '', type: 'Football', capacity: 1, pricePerHour: 0, imageUrl: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['facilities-all'],
    queryFn: () => facilityApi.getAll().then(r => r.data),
  })

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', type: 'Football', capacity: 1, pricePerHour: 0, imageUrl: '' }); setShowModal(true) }
  const openEdit = (f: Facility) => { setEditing(f); setForm({ name: f.name, description: f.description, type: f.type, capacity: f.capacity, pricePerHour: f.pricePerHour, imageUrl: f.imageUrl }); setShowModal(true) }

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => editing
      ? facilityApi.update(editing.id, { ...form, isActive: editing.isActive })
      : facilityApi.create(form),
    onSuccess: () => { toast.success('FACILITY SAVED'); qc.invalidateQueries({ queryKey: ['facilities-all'] }); setShowModal(false) },
    onError: () => toast.error('ERROR OCCURRED')
  })

  const { mutate: del } = useMutation({
    mutationFn: (id: number) => facilityApi.delete(id),
    onSuccess: () => { toast.success('FACILITY DELETED'); qc.invalidateQueries({ queryKey: ['facilities-all'] }) }
  })

  return (
    <div className="w-full min-h-screen bg-black text-white px-8 md:px-20 pt-32 pb-20 uppercase font-sans">
      <div className="max-w-[1500px] mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-ghost-border pb-8 gap-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-wide leading-none">FACILITIES</h1>
          <button className="btn-ghost" onClick={openCreate}>ADD VENUE</button>
        </div>

        {isLoading ? <Spinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {data?.map(f => (
              <div key={f.id} className={`border border-ghost-border p-8 flex flex-col justify-between min-h-[300px] transition-opacity ${!f.isActive ? 'opacity-50' : ''}`}>
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-3xl font-bold tracking-wide">{f.name}</h3>
                    <span className="text-[10px] font-bold tracking-widest border border-white px-2 py-1">{f.isActive ? 'ACTIVE' : 'OFFLINE'}</span>
                  </div>
                  <p className="text-white/60 tracking-widest mb-6 leading-relaxed line-clamp-3">{f.description}</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold tracking-widest mb-8 border-t border-ghost-border pt-4">
                    <span>{f.type} / CAP: {f.capacity}</span>
                    <span>${f.pricePerHour}/HR</span>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => openEdit(f)} className="flex-1 border border-ghost-border hover:bg-white hover:text-black py-3 font-bold tracking-widest transition-colors">EDIT</button>
                    <button onClick={() => setDeleteId(f.id)} className="px-4 border border-red-900 text-red-500 hover:bg-red-900/50 transition-colors">DEL</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8">
            <div className="w-full max-w-lg bg-black border border-white p-12 space-y-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-bold tracking-wide">{editing ? 'EDIT VENUE' : 'NEW VENUE'}</h2>
              
              <div className="space-y-6">
                {[
                  { key: 'name', label: 'NAME', type: 'text' },
                  { key: 'description', label: 'DESCRIPTION', type: 'text' },
                  { key: 'capacity', label: 'CAPACITY', type: 'number' },
                  { key: 'pricePerHour', label: 'RATE ($/HR)', type: 'number' },
                  { key: 'imageUrl', label: 'IMAGE URL', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] font-bold text-white/60 mb-2 tracking-widest">{f.label}</label>
                    <input type={f.type} className="w-full bg-black border border-ghost-border focus:border-white text-white p-4 outline-none tracking-widest uppercase" value={(form as any)[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? +e.target.value : e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-bold text-white/60 mb-2 tracking-widest">TYPE</label>
                  <select className="w-full bg-black border border-ghost-border focus:border-white text-white p-4 outline-none tracking-widest uppercase appearance-none" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    {['Football', 'Basketball', 'Tennis', 'Padel', 'Golf', 'Gym', 'Swimming'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button className="flex-1 btn-ghost" onClick={() => save()} disabled={isPending}>{isPending ? 'SAVING...' : 'SAVE'}</button>
                <button className="px-8 border border-ghost-border hover:border-white tracking-widest font-bold text-xs" onClick={() => setShowModal(false)}>CANCEL</button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)}
          onConfirm={() => deleteId && del(deleteId)}
          title="DELETE VENUE" message="CONFIRM DELETION OF VENUE. THIS IS PERMANENT." danger />
      </div>
    </div>
  )
}

// ─── Admin Users ──────────────────────────────────────────────────────────────
export function AdminUsers() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => userApi.getAll().then(r => r.data) })
  const { mutate: toggle } = useMutation({
    mutationFn: (id: number) => userApi.toggleActive(id),
    onSuccess: () => { toast.success('STATUS UPDATED'); qc.invalidateQueries({ queryKey: ['users'] }) }
  })

  return (
    <div className="w-full min-h-screen bg-black text-white px-8 md:px-20 pt-32 pb-20 uppercase font-sans">
      <div className="max-w-[1500px] mx-auto space-y-12">
        <div className="border-b border-ghost-border pb-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-wide leading-none">MEMBERS</h1>
        </div>
        
        {isLoading ? <Spinner /> : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white">
                  <th className="py-6 px-4 text-xs tracking-widest font-bold text-white/60">ID</th>
                  <th className="py-6 px-4 text-xs tracking-widest font-bold text-white/60">MEMBER</th>
                  <th className="py-6 px-4 text-xs tracking-widest font-bold text-white/60">CONTACT</th>
                  <th className="py-6 px-4 text-xs tracking-widest font-bold text-white/60">ROLE</th>
                  <th className="py-6 px-4 text-xs tracking-widest font-bold text-white/60">STATUS</th>
                  <th className="py-6 px-4 text-xs tracking-widest font-bold text-white/60 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ghost-border">
                {data?.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-6 px-4 font-bold">{u.id}</td>
                    <td className="py-6 px-4 font-bold text-xl">{u.fullName}</td>
                    <td className="py-6 px-4 tracking-widest">
                      <div>{u.email}</div>
                      <div className="text-white/60">{u.phone}</div>
                    </td>
                    <td className="py-6 px-4 tracking-widest font-bold">{u.role}</td>
                    <td className="py-6 px-4">
                      <span className={`text-xs tracking-widest font-bold border px-2 py-1 ${u.isActive ? 'border-white text-white' : 'border-red-500 text-red-500'}`}>
                        {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-right">
                      {u.role !== 'Admin' && (
                        <button onClick={() => toggle(u.id)}
                          className="border border-ghost-border hover:border-white px-6 py-2 text-xs font-bold tracking-widest transition-colors">
                          {u.isActive ? 'SUSPEND' : 'ACTIVATE'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Admin Reports ────────────────────────────────────────────────────────────
export function AdminReports() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportApi.getDashboard().then(r => r.data),
  })

  const exportReport = () => {
    if (!data) return
    const ws = XLSX.utils.json_to_sheet([
      { 'TOTAL RESERVATIONS': data.totalBookings, 'TODAY': data.todayBookings, 'MEMBERS': data.totalUsers, 'REVENUE': data.totalRevenue }
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'REPORT')
    XLSX.writeFile(wb, 'report.xlsx')
    toast.success('EXPORT COMPLETE')
  }

  if (isLoading) return <Spinner />

  return (
    <div className="w-full min-h-screen bg-black text-white px-8 md:px-20 pt-32 pb-20 uppercase font-sans">
      <div className="max-w-[1500px] mx-auto space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-ghost-border pb-8 gap-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-wide leading-none">FINANCIALS</h1>
          <button onClick={exportReport} className="btn-ghost">EXPORT REPORT</button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="border border-ghost-border p-8">
            <span className="text-white/60 text-[10px] tracking-widest font-bold mb-2 block">TOTAL REVENUE</span>
            <span className="text-5xl font-bold">${data?.totalRevenue ?? 0}</span>
          </div>
          <div className="border border-ghost-border p-8">
            <span className="text-white/60 text-[10px] tracking-widest font-bold mb-2 block">MONTHLY REVENUE</span>
            <span className="text-5xl font-bold">${data?.monthRevenue ?? 0}</span>
          </div>
          <div className="border border-ghost-border p-8">
            <span className="text-white/60 text-[10px] tracking-widest font-bold mb-2 block">RESERVATIONS</span>
            <span className="text-5xl font-bold">{data?.totalBookings ?? 0}</span>
          </div>
          <div className="border border-ghost-border p-8">
            <span className="text-white/60 text-[10px] tracking-widest font-bold mb-2 block">VENUES</span>
            <span className="text-5xl font-bold">{data?.activeFacilities ?? 0}</span>
          </div>
        </div>

        <div className="border border-ghost-border p-8">
          <h2 className="text-xl font-bold tracking-widest mb-8 border-b border-ghost-border pb-4">VENUE PERFORMANCE</h2>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ghost-border">
                  <th className="py-4 px-4 text-xs tracking-widest font-bold text-white/60">VENUE</th>
                  <th className="py-4 px-4 text-xs tracking-widest font-bold text-white/60">SESSIONS</th>
                  <th className="py-4 px-4 text-xs tracking-widest font-bold text-white/60 text-right">REVENUE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ghost-border">
                {data?.facilityStats.map((f, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-6 px-4 font-bold text-xl">{f.name}</td>
                    <td className="py-6 px-4 tracking-widest text-lg">{f.totalBookings}</td>
                    <td className="py-6 px-4 text-right font-bold text-2xl">${f.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
