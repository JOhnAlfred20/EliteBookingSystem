import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../lib/api'

// ─── Star Rating Component ───────────────────────────────────────────────────
export function StarRating({ value, onChange, readonly = false, size = 'md' }: {
  value: number; onChange?: (v: number) => void; readonly?: boolean; size?: 'sm' | 'md' | 'lg'
}) {
  const [hover, setHover] = useState(0)
  const s = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' }[size]
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-90'}`}
        >
          <span
            className={`material-symbols-outlined ${s} ${
              star <= (hover || value) ? 'text-tertiary' : 'text-outline-variant/30'
            }`}
            style={{ fontVariationSettings: star <= (hover || value) ? "'FILL' 1" : "'FILL' 0" }}
          >
            star
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: any }) {
  return (
    <div className="card !rounded-[20px] !p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-sm shrink-0">
          {review.userName?.[0] ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-on-surface text-sm">{review.userName}</span>
            <StarRating value={review.rating} readonly size="sm" />
          </div>
          {review.comment && (
            <p className="text-on-surface-variant text-sm mt-2 leading-relaxed">{review.comment}</p>
          )}
          <p className="text-[10px] text-outline font-bold mt-2 uppercase tracking-widest">
            {new Date(review.createdAt).toLocaleDateString('ar-EG')}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Reviews Section ──────────────────────────────────────────────────────────
export function ReviewsSection({ facilityId }: { facilityId: number }) {
  const qc = useQueryClient()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', facilityId],
    queryFn: () => api.get(`/reviews/facility/${facilityId}`).then(r => r.data).catch(() => []),
  })

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => api.post('/reviews', { facilityId, rating, comment }),
    onSuccess: () => {
      toast.success('شكراً لتقييمك!')
      setComment('')
      setShowForm(false)
      qc.invalidateQueries({ queryKey: ['reviews', facilityId] })
    },
    onError: () => toast.error('حدث خطأ أو أنك قيّمت هذا الملعب مسبقاً')
  })

  const avg = reviews?.length
    ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-tertiary/10 px-4 py-2 rounded-2xl border border-tertiary/20 text-center">
            <span className="text-2xl font-black text-tertiary block">{avg}</span>
            <StarRating value={Math.round(Number(avg) || 0)} readonly size="sm" />
            <span className="text-[10px] text-on-surface-variant block">{reviews?.length ?? 0} تقييم</span>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="btn-secondary text-xs flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">rate_review</span>
          {showForm ? 'إلغاء' : 'أضف تقييم'}
        </button>
      </div>

      {/* Add Review Form */}
      {showForm && (
        <div className="border border-ghost-border p-6 bg-black !rounded-[20px] space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">تقييمك</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="اكتب رأيك عن الملعب... (اختياري)"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button onClick={() => submit()} disabled={isPending}
            className="btn-primary w-full text-sm">
            {isPending ? 'جاري الإرسال...' : 'إرسال التقييم'}
          </button>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2].map(i => (
            <div key={i} className="animate-pulse card !rounded-[20px] !p-5 flex gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest/50" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-container-highest/50 rounded w-24" />
                <div className="h-3 bg-surface-container-highest/50 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews?.length === 0 ? (
        <p className="text-center text-on-surface-variant py-4 text-sm">لا توجد تقييمات بعد. كن أول من يقيّم!</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {reviews?.map((r: any) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  )
}
