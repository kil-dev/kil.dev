'use client'

import { LinkButton } from '@/components/ui/link-button'
import { captureProjectVisitClicked } from '@/hooks/posthog'
import type { Route } from 'next'

interface VisitButtonProps {
  href: Route
  title: string
  id: string
}

export function VisitButton({ href, title, id }: VisitButtonProps) {
  return (
    <LinkButton
      href={href}
      external={href.startsWith('http')}
      size="sm"
      aria-label={`Open ${title} website`}
      onClick={() => {
        captureProjectVisitClicked(id, href)
      }}>
      Visit
    </LinkButton>
  )
}
