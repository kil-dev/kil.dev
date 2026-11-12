import { AchievementCard } from '@/components/layout/achievements/achievement-card'
import { AchievementResetButton } from '@/components/layout/achievements/achievement-reset-button'
import { LadybirdSecretListener } from '@/components/layout/achievements/ladybird-secret-listener'
import { AchievementProgress } from '@/components/layout/header/achievement-score'
import { ImagesPreload } from '@/components/ui/images-preload'
import { PageShell } from '@/components/ui/page-shell'
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
    <PageShell
      title="Achievements"
      description="Dopamine hits. Some are hidden."
      actions={<AchievementResetButton />}
      data-testid="achievements-page">
      <ImagesPreload
        images={unlockedImages}
        dataPreload="achievement-images"
        additionalImages={includeUnknown ? [unknownAchievementImage] : undefined}
      />
      <LadybirdSecretListener />
      <AchievementProgress />
      <ul className="grid gap-x-12 gap-y-7 md:grid-cols-2">
        {entries.map(([id]) => (
          <li key={id} className="list-none">
            <AchievementCard id={id} />
          </li>
        ))}
      </ul>
    </PageShell>
  )
}
