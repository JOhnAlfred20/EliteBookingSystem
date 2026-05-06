import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { bookingApi } from '../../services'

// ─── Time Slot Grid ───────────────────────────────────────────────────────────
// Shows available/booked time slots for a specific facility on a selected date
export default function TimeSlotGrid({ facilityId, date, onSelect }: {
  facilityId: number; date: string;
  onSelect: (start: string, end: string) => void
}) {
  const [selected, setSelected] = useState<{ start: string; end: string } | null>(null)

  // Generate time slots from 8 AM to 11 PM
  const slots = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 8
    return {
      start: `${hour.toString().padStart(2, '0')}:00`,
      end: `${(hour + 1).toString().padStart(2, '0')}:00`,
      label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'م' : 'ص'}`,
    }
  })

  // Check conflicts for each slot
  const { data: conflicts, isLoading } = useQuery({
    queryKey: ['slot-conflicts', facilityId, date],
    queryFn: async () => {
      if (!date) return {}
      const results: Record<string, boolean> = {}
      // Check all slots in parallel
      await Promise.all(
        slots.map(async slot => {
          try {
            const res = await bookingApi.checkConflict(
              facilityId, date,
              slot.start + ':00', slot.end + ':00'
            )
            results[slot.start] = res.data.hasConflict
          } catch {
            results[slot.start] = false
          }
        })
      )
      return results
    },
    enabled: !!date,
  })

  const handleSelect = (slot: typeof slots[0]) => {
    if (conflicts?.[slot.start]) return
    if (selected?.start === slot.start) {
      setSelected(null)
    } else {
      setSelected({ start: slot.start, end: slot.end })
      onSelect(slot.start, slot.end)
    }
  }

  if (!date) {
    return (
      <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/5 text-center">
        <span className="material-symbols-outlined text-3xl text-outline/30 block mb-2">calendar_today</span>
        <p className="text-on-surface-variant text-sm">اختر التاريخ أولاً لعرض المواعيد المتاحة</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm">schedule</span>
          الأوقات المتاحة
        </h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-primary/20 border border-primary/40" /> متاح
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-error/20 border border-error/40" /> محجوز
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-primary border border-primary" /> محدد
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="animate-pulse h-12 bg-surface-container-highest/30 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {slots.map(slot => {
            const booked = conflicts?.[slot.start]
            const isSelected = selected?.start === slot.start
            return (
              <button
                key={slot.start}
                onClick={() => handleSelect(slot)}
                disabled={!!booked}
                className={`
                  py-3 px-2 rounded-2xl text-xs font-bold transition-all duration-200 border
                  ${booked
                    ? 'bg-error/10 text-error/50 border-error/20 cursor-not-allowed line-through'
                    : isSelected
                      ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/30 scale-105'
                      : 'bg-surface-container-high/50 text-on-surface-variant border-outline-variant/10 hover:bg-primary/10 hover:border-primary/30 hover:text-primary active:scale-95'
                  }
                `}
              >
                {slot.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
