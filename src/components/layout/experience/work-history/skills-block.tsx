import { SkillIcons } from '@/components/ui/skill-icons'
import type { resolveSkills } from '@/utils/skillicons'

export function SkillsBlock({
  highlightCount,
  skillsEntries,
}: {
  highlightCount: number
  skillsEntries: ReturnType<typeof resolveSkills>
}) {
  return (
    <div
      className="mt-0 max-h-0 overflow-hidden opacity-0 transition-[max-height,opacity,margin] [transition-delay:var(--delay-out-skills)] duration-300 ease-[cubic-bezier(0.2,0.8,0.16,1)] group-data-[state=open]:mt-1 group-data-[state=open]:max-h-[240px] group-data-[state=open]:opacity-100 group-data-[state=open]:[transition-delay:var(--delay-in-skills)]"
      style={{ '--delay-in-skills': `${highlightCount * 80}ms`, '--delay-out-skills': `0ms` } as React.CSSProperties}>
      <div className="mt-2 pl-5">
        <h4 className="mb-1 text-xs font-medium text-muted-foreground">Skills</h4>
        <SkillIcons
          skills={skillsEntries}
          staggerOnOpen
          perItemDelayMs={80}
          translateAxis="x"
          baseDelayMs={highlightCount * 80}
        />
      </div>
    </div>
  )
}
