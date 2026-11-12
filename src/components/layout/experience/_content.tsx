import { UnlockOnMount } from '@/components/layout/achievements/unlock-on-mount'
import { PageShell } from '@/components/ui/page-shell'
import type { AchievementId } from '@/lib/achievements'
import { WorkHistory } from './work-history/_content'

export function ExperienceContent() {
  return (
    <PageShell section="experience" title="Experience" description="Where I’ve been">
      <UnlockOnMount id={'EXPERIENCE_EXPLORER' as AchievementId} />
      <WorkHistory />
    </PageShell>
  )
}
