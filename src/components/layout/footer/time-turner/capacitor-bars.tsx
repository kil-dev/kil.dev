'use client'

export function CapacitorBars({ total }: Readonly<{ total: number }>) {
  return (
    <div className="grid grid-cols-3 items-end gap-3">
      {[0, 1, 2].map(i => {
        const segStart = i * 100
        const segVal = Math.max(0, Math.min(100, total - segStart))
        return (
          <div key={i} className="h-28 w-4 overflow-hidden rounded bg-muted shadow-inner ring-1 ring-border">
            <div
              className="w-full bg-primary transition-[height] duration-150 ease-linear"
              style={{ height: `${segVal}%` }}
              aria-hidden
            />
          </div>
        )
      })}
    </div>
  )
}
