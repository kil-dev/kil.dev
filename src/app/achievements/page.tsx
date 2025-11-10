import { AchievementCard } from '@/components/layout/achievements/achievement-card'
import { AchievementResetButton } from '@/components/layout/achievements/achievement-reset-button'
import { LadybirdSecretListener } from '@/components/layout/achievements/ladybird-secret-listener'
import { ImagesPreload } from '@/components/ui/images-preload'
import { SectionLabel } from '@/components/ui/section-label'
import unknownAchievementImage from '@/images/achievements/unknown.webp'
import { ACHIEVEMENTS, type AchievementId } from '@/lib/achievements'
import type { StaticImageData } from 'next/image'

export default function AchievementsPage() {
  const entries: Array<[AchievementId, (typeof ACHIEVEMENTS)[AchievementId]]> = Object.entries(ACHIEVEMENTS) as Array<
    [AchievementId, (typeof ACHIEVEMENTS)[AchievementId]]
  >

  const seen = new Set<string>()
  const unlockedImages: StaticImageData[] = []

  for (const [, definition] of entries) {
    const key = definition.imageSrc.src
    if (seen.has(key)) continue
    seen.add(key)
    unlockedImages.push(definition.imageSrc)
  }

  const includeUnknown = !seen.has(unknownAchievementImage.src)

  return (
    <div className="px-10 py-16 md:px-20 lg:px-40" data-testid="achievements-page">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <ImagesPreload
          images={unlockedImages}
          dataPreload="achievement-images"
          additionalImages={includeUnknown ? [unknownAchievementImage] : undefined}
        />
        <LadybirdSecretListener />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold md:text-3xl">Achievements</h1>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <SectionLabel as="p">Dopamine Hits</SectionLabel>
              <p className="text-muted-foreground">Some are hidden. Can you find them all?</p>
            </div>
            <AchievementResetButton />
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(([id]) => (
            <li key={id} className="list-none">
              <AchievementCard id={id} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
