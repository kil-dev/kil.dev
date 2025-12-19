import { ExperienceMapTooltip } from '@/components/ui/experience-map-tooltip'
import type { WorkExperience } from '@/types/work-experience'
import { resolveSkills } from '@/utils/skillicons'
import { formatMonthYear } from '@/utils/utils'
import { CollapsibleHighlights } from './collapsible-highlights'
import { CompanyMarker } from './company-marker'

function formatDate(value: string | undefined) {
  if (!value) return 'Present'
  return formatMonthYear(value, 'en-US')
}

export function WorkHistoryItem({ item }: { item: WorkExperience }) {
  const when = `${formatDate(item.from)} - ${formatDate(item.to)}`
  const skillsEntries = item.skills ? resolveSkills(item.skills) : []

  return (
    <li className="relative py-4 pl-6 last:pb-0">
      <CompanyMarker item={item} />
      <div className="relative overflow-hidden rounded-3xl bg-transparent p-6 shadow-none backdrop-blur-2xs">
        <div className="flex flex-col gap-2">
          <div className="-mt-2 flex flex-wrap items-baseline gap-2">
            <h3 className="text-sm font-semibold md:text-base">{item.role}</h3>
            <span className="text-sm text-muted-foreground">@ {item.company}</span>
          </div>
          <div className="flex flex-col text-xs text-muted-foreground md:flex-row md:items-center md:text-sm">
            <span>{when}</span>
            <ExperienceMapTooltip workExperience={item}>
              <button
                type="button"
                className="text-primary md:ml-2 md:before:mx-2 md:before:text-inherit md:before:content-['·']"
                aria-label={`Open map of ${item.workLocation.location} and ${item.officeLocation?.location}`}
                title={`View map: ${item.workLocation.location} and ${item.officeLocation?.location}`}>
                {item.workLocation.location} {item.officeLocation ? `[${item.officeLocation.location}]` : ''}
              </button>
            </ExperienceMapTooltip>
          </div>
          <p className="text-sm leading-relaxed md:text-base">{item.summary}</p>

          {(item.highlights && item.highlights.length > 0) || skillsEntries.length > 0 ? (
            <CollapsibleHighlights item={item} skillsEntries={skillsEntries} />
          ) : null}
        </div>
      </div>
    </li>
  )
}
