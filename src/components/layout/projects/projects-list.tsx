'use client'

import { Picker } from '@/components/ui/picker'
import type { Project } from '@/types/projects'
import Image from 'next/image'
import { RepoButton } from './project-card/repo-button'
import { VisitButton } from './project-card/visit-button'

const STATUS_LABEL: Record<NonNullable<Project['status']>, string> = {
  live: 'Live',
  wip: 'Work in progress',
  archived: 'Archived',
}

/** Every project on one screen: pick one on the left to see it on the right. */
export function ProjectsList({ items }: { items: Project[] }) {
  if (items.length === 0) return <p className="text-muted-foreground">No projects yet.</p>

  return (
    <Picker
      items={items}
      name="project"
      legend="Choose a project"
      label={project => project.title}
      avatar={project => <Image src={project.imageSrc} alt="" fill sizes="36px" className="object-cover" />}>
      {project => (
        <article className="grid content-start gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] md:gap-8 compact:gap-3! sm:compact:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]!">
          <div className="relative aspect-16/10 overflow-hidden slime-frame max-sm:aspect-auto max-sm:h-[max(7rem,calc(100dvh-var(--frame-top)-var(--frame-bottom)-20.5rem))]">
            <Image
              src={project.imageSrc}
              alt={project.imageAlt}
              fill
              sizes="(max-width: 1024px) 80vw, 32rem"
              placeholder="blur"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="text-2xl leading-tight font-black tracking-tight md:text-3xl compact:text-lg!">
                {project.title}
              </h3>
              <p className="flex gap-3 text-sm display-text">
                <span className="text-coin">{STATUS_LABEL[project.status ?? 'live']}</span>
                {project.year ? <span className="text-muted-foreground">{project.year}</span> : null}
              </p>
            </div>
            <p className="leading-relaxed text-muted-foreground compact:text-sm">{project.description}</p>
            {(project.href ?? project.repo) ? (
              <div className="mt-1 flex gap-3">
                {project.href ? <VisitButton href={project.href} title={project.title} id={project.id} /> : null}
                {project.repo ? <RepoButton repo={project.repo} title={project.title} id={project.id} /> : null}
              </div>
            ) : null}
          </div>
        </article>
      )}
    </Picker>
  )
}
