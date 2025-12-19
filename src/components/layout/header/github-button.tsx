'use client'

import { GitHubIcon } from '@/components/icons/github'
import { LinkButton } from '@/components/ui/link-button'
import { captureSocialLinkClicked } from '@/hooks/posthog'
import { useTrackedExternalLink } from '@/hooks/use-tracked-external-link'
import { SOCIAL_LINKS } from '@/lib/social-links'

export function GitHubButton() {
  const { handleClick } = useTrackedExternalLink(() => captureSocialLinkClicked('github', SOCIAL_LINKS.GITHUB))
  return (
    <LinkButton
      href={SOCIAL_LINKS.GITHUB}
      external
      className="h-10 min-w-0 rounded-lg bg-secondary px-4 text-sm font-bold text-secondary-foreground ring-offset-background duration-300 hover:bg-accent hover:ring-1 hover:ring-accent hover:ring-offset-2"
      aria-label="Open Kilian's GitHub profile in a new tab"
      onClick={handleClick}>
      <GitHubIcon className="size-5" />
    </LinkButton>
  )
}
