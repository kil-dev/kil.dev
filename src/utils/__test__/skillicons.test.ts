import type { SkillName } from '@/lib/skillicons'
import { describe, expect, it } from 'vitest'
import { getSkillIconUrl, resolveSkills } from '../skillicons'

describe('getSkillIconUrl', () => {
  it('returns correct URL for string icon', () => {
    const result = getSkillIconUrl('nextjs')
    expect(result).toBe('/api/image/skills/nextjs')
  })

  it('encodes special characters in string icon', () => {
    const result = getSkillIconUrl('test icon/with space')
    expect(result).toContain(encodeURIComponent('test icon/with space'))
  })

  it('returns correct URL for dashboardicons with webp format', () => {
    const result = getSkillIconUrl({
      source: 'dashboardicons',
      name: 'flux-cd',
      format: 'webp',
    })
    expect(result).toBe('/api/image/dbi/webp/flux-cd.webp')
  })

  it('returns correct URL for dashboardicons with png format', () => {
    const result = getSkillIconUrl({
      source: 'dashboardicons',
      name: 'talos',
      format: 'png',
    })
    expect(result).toBe('/api/image/dbi/png/talos.png')
  })

  it('defaults to webp format when format is not provided', () => {
    const result = getSkillIconUrl({
      source: 'dashboardicons',
      name: 'test',
    })
    expect(result).toBe('/api/image/dbi/webp/test.webp')
  })

  it('encodes special characters in dashboardicons name', () => {
    const result = getSkillIconUrl({
      source: 'dashboardicons',
      name: 'special/name',
      format: 'webp',
    })
    expect(result).toContain(encodeURIComponent('special/name'))
  })

  it('returns fallback URL for unexpected icon format', () => {
    const result = getSkillIconUrl({} as never)
    expect(result).toBe('/api/image/skills/')
  })
})

describe('resolveSkills', () => {
  it('resolves single skill name', () => {
    const result = resolveSkills(['Next'])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      name: 'Next',
      icon: 'nextjs',
      url: 'https://nextjs.org',
    })
  })

  it('resolves multiple skill names', () => {
    const result = resolveSkills(['Next', 'React', 'TypeScript'])
    expect(result).toHaveLength(3)
    expect(result[0]?.name).toBe('Next')
    expect(result[1]?.name).toBe('React')
    expect(result[2]?.name).toBe('TypeScript')
  })

  it('includes icon and url for each skill', () => {
    const result = resolveSkills(['Tailwind'])
    expect(result[0]).toEqual({
      name: 'Tailwind',
      icon: 'tailwind',
      url: 'https://tailwindcss.com',
    })
  })

  it('handles dashboardicons format', () => {
    const result = resolveSkills(['FluxCD'])
    expect(result[0]).toEqual({
      name: 'FluxCD',
      icon: { source: 'dashboardicons', name: 'flux-cd', format: 'webp' },
      url: 'https://fluxcd.io',
    })
  })

  it('returns empty array for empty input', () => {
    const result = resolveSkills([])
    expect(result).toEqual([])
  })

  it('preserves order of skill names', () => {
    const skillNames: SkillName[] = ['Vercel', 'React', 'Next']
    const result = resolveSkills(skillNames)
    expect(result.map(s => s.name)).toEqual(['Vercel', 'React', 'Next'])
  })
})
