import { cn } from '@/utils/utils'
import Image, { type StaticImageData } from 'next/image'

type AchievementBadgeProps = {
  image: StaticImageData
  alt: string
  /** Rendered width in px, passed to the image loader so it fetches a fitting size. */
  size: number
  locked?: boolean
  className?: string
}

/**
 * An achievement's badge: its art in a circle with a rim of slime. The one shape is used on
 * the achievements page and in the popup. A locked badge is dimmed and has a plain rim.
 */
export function AchievementBadge({ image, alt, size, locked = false, className }: AchievementBadgeProps) {
  return (
    <span
      className={cn(
        'relative block aspect-square shrink-0 overflow-hidden rounded-full',
        locked ? 'opacity-60 shadow-[0_0_0_3px_var(--border)]' : 'shadow-[0_0_0_3px_var(--primary)]',
        className,
      )}>
      <Image src={image} alt={alt} fill sizes={`${size}px`} className="object-cover" />
    </span>
  )
}
