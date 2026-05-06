// Skeleton Loading Components
export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[32px] bg-surface-container-high/60 overflow-hidden">
      <div className="h-[280px] bg-surface-container-highest/50" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-surface-container-highest/50 rounded-full w-3/4" />
        <div className="h-3 bg-surface-container-highest/50 rounded-full w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-surface-container-highest/50 rounded-lg w-20" />
          <div className="h-6 bg-surface-container-highest/50 rounded-lg w-16" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonBookingCard() {
  return (
    <div className="animate-pulse card border-r-4 border-surface-container-highest !rounded-[24px]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex gap-2">
            <div className="h-5 bg-surface-container-highest/50 rounded-full w-32" />
            <div className="h-5 bg-surface-container-highest/50 rounded-full w-16" />
          </div>
          <div className="flex gap-4">
            <div className="h-4 bg-surface-container-highest/50 rounded-full w-24" />
            <div className="h-4 bg-surface-container-highest/50 rounded-full w-20" />
            <div className="h-4 bg-surface-container-highest/50 rounded-full w-16" />
          </div>
        </div>
        <div className="h-8 bg-surface-container-highest/50 rounded-full w-24" />
      </div>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="animate-pulse border border-ghost-border p-6 bg-black !p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-surface-container-highest/50" />
      <div className="space-y-2">
        <div className="h-3 bg-surface-container-highest/50 rounded-full w-20" />
        <div className="h-6 bg-surface-container-highest/50 rounded-full w-12" />
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="border border-ghost-border p-6 bg-black h-32" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <SkeletonStatCard key={i} />)}
      </div>
      <div className="space-y-4">
        {[1,2,3].map(i => <SkeletonBookingCard key={i} />)}
      </div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="border border-ghost-border p-6 bg-black animate-pulse">
      <div className="space-y-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex gap-4 py-3">
            <div className="h-4 bg-surface-container-highest/50 rounded w-8" />
            <div className="h-4 bg-surface-container-highest/50 rounded flex-1" />
            <div className="h-4 bg-surface-container-highest/50 rounded w-32" />
            <div className="h-4 bg-surface-container-highest/50 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
