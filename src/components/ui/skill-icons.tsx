'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { SkillEntry } from '@/lib/skillicons'
import { getSkillIconUrl } from '@/utils/skillicons'
import Image from 'next/image'
import Link from 'next/link'

function SkillIconInner({ name, icon }: Pick<SkillEntry, 'name' | 'icon'>) {
  return (
    <span
      role="img"
      aria-label={name}
      className="inline-flex size-[28px] items-center justify-center overflow-hidden rounded-md ring-1 ring-border">
      <span className="relative size-full">
        <Image src={getSkillIconUrl(icon)} alt={name} fill sizes="28px" className="object-contain" loading="lazy" />
      </span>
    </span>
  )
}

function SkillIcon({ name, icon, url }: Pick<SkillEntry, 'name' | 'icon' | 'url'>) {
  const content = <SkillIconInner name={name} icon={icon} />

  if (!url) return content

  return (
    <Link
      href={url}
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
}

interface SkillIconsProps {
  skills: SkillEntry[]
  staggerOnOpen?: boolean
  perItemDelayMs?: number
  translateAxis?: 'x' | 'y'
  baseDelayMs?: number
}

export function SkillIcons({
  skills,
  staggerOnOpen = false,
  perItemDelayMs = 80,
  translateAxis = 'x',
  baseDelayMs = 0,
}: SkillIconsProps) {
  const baseTransition = 'transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.16,1)]'
  const translateClosed = translateAxis === 'y' ? 'translate-y-1' : 'translate-x-1'
  const translateOpen =
    translateAxis === 'y'
      ? 'group-data-[state=open]/collapsible:translate-y-0'
      : 'group-data-[state=open]/collapsible:translate-x-0'

  return (
    <div className="flex flex-wrap items-center gap-2">
      {skills.map(({ name, icon, url }, idx) => {
        const wrapperClass = staggerOnOpen
          ? `${baseTransition} opacity-0 ${translateClosed} group-data-[state=open]/collapsible:opacity-100 ${translateOpen}`
          : ''
        const wrapperStyle = staggerOnOpen
          ? ({ transitionDelay: `${baseDelayMs + idx * perItemDelayMs}ms` } as React.CSSProperties)
          : undefined

        return (
          <span key={name} className={wrapperClass} style={wrapperStyle}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SkillIcon name={name} icon={icon} url={url} />
              </TooltipTrigger>
              <TooltipContent>{name}</TooltipContent>
            </Tooltip>
          </span>
        )
      })}
    </div>
  )
}
