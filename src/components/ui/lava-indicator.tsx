import { cn } from '@/utils/utils'

export type LavaIndicatorState = {
  left: number
  width: number
  visible: boolean
  animate: boolean
}

const BLOB = 'absolute rounded-full bg-primary will-change-[left,width]'

/**
 * A slime blob behind the active item. The body moves first and a thinner tail catches up;
 * the goo filter fuses them, so the blob stretches and snaps back as it travels.
 */
export function LavaIndicator({ indicator }: { indicator: LavaIndicatorState }) {
  const visibility = indicator.visible ? 'opacity-100' : 'opacity-0'
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-4 -inset-y-3 z-0 filter-[url(#slime-goo)]">
        <span
          className={cn(
            BLOB,
            'top-6 bottom-6',
            indicator.animate && 'transition-[left,width,opacity] duration-900 ease-[cubic-bezier(0.16,1,0.3,1)]',
            visibility,
          )}
          style={{ left: indicator.left + 16 + indicator.width * 0.15, width: indicator.width * 0.7 }}
        />
        <span
          className={cn(
            BLOB,
            'top-4 bottom-4',
            indicator.animate && 'transition-[left,width,opacity] duration-450 ease-jelly',
            visibility,
          )}
          style={{ left: indicator.left + 16, width: indicator.width }}
        />
        {/* A drop that keeps trying to fall off the blob */}
        <span
          className={cn(
            BLOB,
            'bottom-3 size-2.5 motion-safe:animate-[kd-drip_3.2s_ease-in-out_infinite]',
            indicator.animate && 'transition-[left,opacity] duration-700 ease-jelly',
            visibility,
          )}
          style={{ left: indicator.left + 16 + indicator.width * 0.68 }}
        />
      </div>
      <svg aria-hidden="true" className="absolute size-0">
        <filter id="slime-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
        </filter>
      </svg>
    </>
  )
}

export function LavaFallbackIndicator() {
  return <span aria-hidden="true" className="absolute top-0 right-1 bottom-0 left-1 z-0 rounded-full bg-primary" />
}
