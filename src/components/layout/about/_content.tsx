import { UnlockOnMount } from '@/components/layout/achievements/unlock-on-mount'
import { PageShell } from '@/components/ui/page-shell'
import type { AchievementId } from '@/lib/achievements'
import { AboutMeQuickFacts } from './aboutme/aboutme-quickfacts'
import { AboutMeText } from './aboutme/aboutme-text'
import { PetsContent } from './pets/_content'

export function AboutContent() {
  return (
    <>
      <PageShell section="about" title="About" description="Hi, I’m Kilian">
        <UnlockOnMount id={'ABOUT_AMBLER' as AchievementId} />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16 max-lg:compact:gap-8">
          <AboutMeText />
          <AboutMeQuickFacts />
        </div>
      </PageShell>
      <PetsContent />
    </>
  )
}
