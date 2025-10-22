'use client'

import { AchievementCardBack } from '@/components/layout/achievements/achievement-card-back'
import { AchievementCardFront } from '@/components/layout/achievements/achievement-card-front'
import { useAchievements } from '@/components/providers/achievements-provider'
import { FlippingCard } from '@/components/ui/flipping-card'
import unknownAchievementImage from '@/images/achievements/unknown.webp'
import { ACHIEVEMENTS, type AchievementId } from '@/lib/achievements'
import { isLadybirdUA } from '@/utils/ladybird'
import { format, isValid as isValidDate, parseISO } from 'date-fns'
import { useEffect, useState } from 'react'

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
    <div id={`ach-card-${kebabId}`} className="relative">
      <style dangerouslySetInnerHTML={{ __html: styleRules }} />

      {/* Unlocked variant (hidden by default until data attribute is present) */}
      <div className={`card-${kebabId}-unlocked hidden`}>
        <FlippingCard
          front={<AchievementCardFront />}
          back={<AchievementCardBack title={def.title} description={unlockedDescription} footer={unlockedFooter} />}
          backgroundImageSrc={def.imageSrc}
          backgroundImageAlt={def.imageAlt}
          backgroundSizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          ariaLabel={`Achievement: ${def.title}`}
          className="rounded-xl"
          flipLabelFrontDesktop="View details"
          flipLabelFrontMobile="Tap for details"
          flipLabelBackDesktop="Go back"
          flipLabelBackMobile="Tap to go back"
        />
      </div>

      {/* Locked variant (visible by default; hidden when data attribute is present) */}
      <div className={`card-${kebabId}-locked block`}>
        <FlippingCard
          front={<AchievementCardFront />}
          back={
            <AchievementCardBack
              title="Hidden achievement"
              description={lockedDescription}
              footer="Keep exploring the site!"
            />
          }
          backgroundImageSrc={unknownAchievementImage}
          backgroundImageAlt="Unknown achievement"
          backgroundSizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          ariaLabel="Hidden achievement"
          className="rounded-xl"
          flipLabelFrontDesktop="View a hint"
          flipLabelFrontMobile="Tap for a hint"
          flipLabelBackDesktop="Go back"
          flipLabelBackMobile="Tap to go back"
        />
      </div>
    </div>
  )
}
