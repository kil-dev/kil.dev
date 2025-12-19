'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { SkillEntry } from '@/lib/skillicons'
import { getSkillIconUrl } from '@/utils/skillicons'
import Image from 'next/image'
import Link from 'next/link'

interface ProjectTechIconsProps {
  skills: SkillEntry[]
}

export function ProjectTechIcons({ skills }: ProjectTechIconsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {skills.map(({ name, icon, url }) => {
        return (
          <Tooltip key={name}>
            <TooltipTrigger asChild>
              {(() => {
                const homepage = url
                const content = (
                  <span
                    role="img"
                    aria-label={name}
                    className="inline-flex size-[28px] items-center justify-center overflow-hidden rounded-md ring-1 ring-border">
                    <span className="relative size-full">
                      <Image
                        src={getSkillIconUrl(icon)}
                        alt={name}
                        fill
                        sizes="28px"
                        className="object-contain"
                        loading="lazy"
                      />
                    </span>
                  </span>
                )

                if (!homepage) return content

                return (
                  <Link
                    href={homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${name} homepage`}
                    onClick={e => {
                      e.stopPropagation()
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation()
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-md focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary">
                    {content}
                  </Link>
                )
              })()}
            </TooltipTrigger>
            <TooltipContent>{name}</TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
