'use client'

import { useAchievements } from '@/components/providers/achievements-provider'
import unknownAchievementImage from '@/images/achievements/unknown.webp'
import { ACHIEVEMENTS, type AchievementId } from '@/lib/achievements'
import { isLadybirdUA } from '@/utils/ladybird'
import { cn } from '@/utils/utils'
import { format, isValid as isValidDate, parseISO } from 'date-fns'
import type { StaticImageData } from 'next/image'
import { useEffect, useState } from 'react'
import { AchievementBadge } from './achievement-badge'

function toKebabCase(input: string): string {
  return input.toLowerCase().replaceAll('_', '-')
}

export function AchievementCard({ id }: { id: AchievementId }) {
  const { unlocked } = useAchievements()
  const def = ACHIEVEMENTS[id]

  const kebabId = toKebabCase(id)
  const isLadybird = isLadybirdUA()

  // Footer text for unlocked: default to SSR-stable 'Unlocked', upgrade after mount to include timestamp
  const [unlockedFooter, setUnlockedFooter] = useState<string>('Unlocked')
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const unlockedAt = unlocked[id]
      if (!unlockedAt) {
        setUnlockedFooter('Unlocked')
        return
      }
      const isoDate = parseISO(unlockedAt)
      if (isValidDate(isoDate)) {
        setUnlockedFooter(`Unlocked: ${format(isoDate, 'PP p')}`)
        return
      }
      const fallbackDate = new Date(unlockedAt)
      setUnlockedFooter(Number.isNaN(fallbackDate.getTime()) ? 'Unlocked' : `Unlocked: ${format(fallbackDate, 'PP p')}`)
    })
    return () => cancelAnimationFrame(frame)
  }, [id, unlocked])

  // Adjust description for Ladybird achievement (if ever re-enabled)
  const unlockedDescription = (() => {
    if (id === ('LADYBIRD_LANDING' as AchievementId)) {
      let friendTip = "Thanks for checking out the site on Ladybird! (I assume you did that and didn't cheat, right?)"
      if (isLadybird) {
        friendTip = 'Tip for friends not on Ladybird: on the Achievements page, type "ladybird!" to unlock this.'
      }
      return (def.cardDescription + ' ' + friendTip) as typeof def.cardDescription
    }
    return def.cardDescription
  })()

  const lockedDescription = (() => {
    if (id === ('LADYBIRD_LANDING' as AchievementId) && isLadybird) {
      return 'Tip for friends not on Ladybird: on the Achievements page, type "ladybird!" to unlock this.'
    }
    return def.unlockHint
  })()

  // Inline CSS to gate locked/unlocked variants purely from root data attributes, preventing initial flicker
  const styleRules = `
html[data-achievement-${kebabId}="true"] #ach-card-${kebabId} .card-${kebabId}-locked{display:none}
html[data-achievement-${kebabId}="true"] #ach-card-${kebabId} .card-${kebabId}-unlocked{display:block}
`

  return (
    <div id={`ach-card-${kebabId}`}>
      <style dangerouslySetInnerHTML={{ __html: styleRules }} />

      {/* Unlocked variant (hidden by default until data attribute is present) */}
      <div className={`card-${kebabId}-unlocked hidden`}>
        <AchievementRow
          image={def.imageSrc}
          imageAlt={def.imageAlt}
          title={def.title}
          description={unlockedDescription}
          footer={unlockedFooter}
        />
      </div>

      {/* Locked variant (visible by default; hidden when data attribute is present) */}
      <div className={`card-${kebabId}-locked block`}>
        <AchievementRow
          image={unknownAchievementImage}
          imageAlt="Unknown achievement"
          title="Hidden achievement"
          description={lockedDescription}
          locked
        />
      </div>
    </div>
  )
}

function AchievementRow({
  image,
  imageAlt,
  title,
  description,
  footer,
  locked = false,
}: {
  image: StaticImageData
  imageAlt: string
  title: string
  description: string
  footer?: string
  locked?: boolean
}) {
  return (
    <div className="grid grid-cols-[5rem_1fr] items-center gap-4 sm:grid-cols-[6rem_1fr] sm:gap-5">
      <AchievementBadge image={image} alt={imageAlt} size={96} locked={locked} />
      <div className="flex flex-col gap-1">
        <h2 className={cn('text-lg leading-tight font-black tracking-tight', locked && 'text-muted-foreground')}>
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        {footer ? <p className="text-xs display-text text-coin">{footer}</p> : null}
      </div>
    </div>
  )
}
