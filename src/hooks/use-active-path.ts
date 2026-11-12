'use client'

import { NAVIGATION } from '@/lib/navmenu'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/** The href of the current nav item: the route, or on the single-page home the section in view. */
export function useActivePath() {
  const pathname = usePathname()
  const [sectionHref, setSectionHref] = useState<string | null>(null)

  useEffect(() => {
    if (pathname !== '/') return
    // Read positions on scroll instead of observing the sections: they can stream in after the header mounts.
    // The current item is the last one whose section has started.
    const update = () => {
      const line = window.innerHeight * 0.45
      const current = NAVIGATION.findLast(({ href }) => {
        const rect = href.startsWith('/#') ? document.getElementById(href.slice(2))?.getBoundingClientRect() : null
        return rect && rect.top <= line
      })
      setSectionHref(current?.href ?? null)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [pathname])

  return pathname === '/' ? (sectionHref ?? pathname) : pathname
}
