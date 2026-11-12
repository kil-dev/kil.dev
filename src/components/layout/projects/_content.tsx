import { UnlockOnMount } from '@/components/layout/achievements/unlock-on-mount'
import { PageShell } from '@/components/ui/page-shell'
import type { AchievementId } from '@/lib/achievements'
import { projects } from '@/lib/projects'
import { ProjectsList } from './projects-list'

export function ProjectsContent() {
  return (
    <PageShell section="projects" title="Projects" description="Some projects I've worked on">
      <UnlockOnMount id={'PROJECTS_PERUSER' as AchievementId} />
      <ProjectsList items={projects} />
    </PageShell>
  )
}
