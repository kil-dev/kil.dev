import { UnlockOnMount } from '@/components/layout/achievements/unlock-on-mount'
import { SectionLabel } from '@/components/ui/section-label'
import type { AchievementId } from '@/lib/achievements'
import { projects } from '@/lib/projects'
import type { Project } from '@/types/projects'
import Image from 'next/image'
import { ProjectsGrid } from './projects-grid'

export function ProjectsContent() {
  return (
    <div className="px-10 py-16 md:px-20 lg:px-40">
      <UnlockOnMount id={'PROJECTS_PERUSER' as AchievementId} />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex flex-col gap-2">
          <SectionLabel as="p">{"Some projects I've worked on"}</SectionLabel>
        </div>
        <ProjectImagesPreload items={projects} />
        <ProjectsGrid items={projects} />
      </div>
    </div>
  )
}

interface ProjectImagesPreloadProps {
  items: Project[]
}

function ProjectImagesPreload({ items }: ProjectImagesPreloadProps) {
  if (items.length === 0) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
      data-preload="projects">
      {items.map(project => (
        <Image
          key={project.id}
          src={project.imageSrc}
          alt=""
          priority
          fetchPriority="high"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ))}
    </div>
  )
}
