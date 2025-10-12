'use client'

export function CapacitorBars({ total }: Readonly<{ total: number }>) {
  return (
    <div className="grid grid-cols-3 gap-3 items-end">
      {[0, 1, 2].map(i => {
        const segStart = i * 100
        const segVal = Math.max(0, Math.min(100, total - segStart))
        return (
          <div key={i} className="h-28 w-4 rounded bg-muted ring-1 ring-border shadow-inner overflow-hidden">
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
