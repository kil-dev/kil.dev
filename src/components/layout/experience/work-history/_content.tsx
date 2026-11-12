'use client'

import { ExperienceMapTooltip } from '@/components/ui/experience-map-tooltip'
import { Picker } from '@/components/ui/picker'
import { SkillIcons } from '@/components/ui/skill-icons'
import { captureCompanyLogoClicked, captureWorkExperienceSelected } from '@/hooks/posthog'
import { WORK_HISTORY } from '@/lib/experience'
import type { WorkExperience } from '@/types/work-experience'
import { resolveSkills } from '@/utils/skillicons'
import { formatMonthYear } from '@/utils/utils'
import Image from 'next/image'

function formatDate(value: string | undefined) {
  return value ? formatMonthYear(value, 'en-US') : 'Present'
}

/** Every job on one screen: pick a company on the left to read that role on the right. */
export function WorkHistory() {
  if (WORK_HISTORY.length === 0) return <p className="text-muted-foreground">No experience added yet.</p>

  return (
    <Picker
      items={WORK_HISTORY}
      name="job"
      legend="Choose a job"
      label={job => job.company}
      avatar={job =>
        job.companyLogoSrc ? (
          <Image src={job.companyLogoSrc} alt="" fill sizes="36px" className="object-cover" />
        ) : (
          job.company.charAt(0)
        )
      }
      onSelect={job => captureWorkExperienceSelected(job.id)}>
      {job => <Job item={job} />}
    </Picker>
  )
}

// On a phone a long list of highlights scrolls inside its own box, so the role, dates and skills
// around it stay on screen.
function Job({ item }: { item: WorkExperience }) {
  const skills = item.skills ? resolveSkills(item.skills) : []
  const href = item.companyUrl

  return (
    <article className="flex max-w-3xl flex-col gap-4 compact:max-w-none compact:gap-2.5">
      <div>
        <h3 className="text-2xl leading-tight font-black tracking-tight md:text-3xl compact:text-lg!">{item.role}</h3>
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm text-muted-foreground md:text-base">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline decoration-border decoration-2 underline-offset-4 hover:decoration-primary"
              onClick={() => captureCompanyLogoClicked(item.id, href)}>
              {item.company}
            </a>
          ) : (
            <span className="font-medium text-foreground">{item.company}</span>
          )}
          <span>
            {formatDate(item.from)} - {formatDate(item.to)}
          </span>
          <ExperienceMapTooltip workExperience={item}>
            <button
              type="button"
              className="text-primary"
              aria-label={`Open map of ${item.workLocation.location} and ${item.officeLocation?.location}`}
              title={`View map: ${item.workLocation.location} and ${item.officeLocation?.location}`}>
              {item.workLocation.location} {item.officeLocation ? `[${item.officeLocation.location}]` : ''}
            </button>
          </ExperienceMapTooltip>
        </div>
      </div>
      {item.summary ? <p className="leading-relaxed text-muted-foreground compact:text-sm">{item.summary}</p> : null}
      {item.highlights?.length ? (
        <ul className="flex flex-col gap-1.5 text-sm max-sm:max-h-[max(6rem,calc(100svh-var(--frame-top)-var(--frame-bottom)-19.5rem))] max-sm:overflow-y-auto max-sm:overscroll-contain max-sm:pr-1 md:text-base compact:text-sm! compact:sm:block compact:sm:columns-2 compact:sm:gap-x-8 [&>li]:break-inside-avoid compact:sm:[&>li]:mb-1.5">
          {item.highlights.map(highlight => (
            <li
              key={highlight}
              className="relative pl-5 before:absolute before:top-[0.55em] before:left-0 before:size-2 before:rounded-full before:bg-primary">
              {highlight}
            </li>
          ))}
        </ul>
      ) : null}
      {skills.length > 0 ? <SkillIcons skills={skills} /> : null}
    </article>
  )
}
