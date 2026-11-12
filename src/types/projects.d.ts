import type { SkillName } from '@/lib/skillicons'
import type { Route } from 'next'
import type { StaticImageData } from 'next/image'

export interface Project {
  id: string
  title: string
  description: string
  /** What it is built with. Not shown on the page; Ask Kilian uses it to answer questions. */
  tags: SkillName[]
  href?: Route
  repo?: Route
  year?: number
  status?: 'live' | 'wip' | 'archived'
  imageSrc: StaticImageData
  imageAlt: string
}
