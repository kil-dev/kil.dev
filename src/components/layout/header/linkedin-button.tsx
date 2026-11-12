'use client'
import { LinkedInIcon } from '@/components/icons/linkedin'
import { LinkButton } from '@/components/ui/link-button'
import { captureSocialLinkClicked } from '@/hooks/posthog'
import { useTrackedExternalLink } from '@/hooks/use-tracked-external-link'
import { SOCIAL_LINKS } from '@/lib/social-links'

export function LinkedInButton() {
  const { handleClick } = useTrackedExternalLink(() => captureSocialLinkClicked('linkedin', SOCIAL_LINKS.LINKEDIN))
  return (
    <LinkButton
      href={SOCIAL_LINKS.LINKEDIN}
      external
      variant="onPrimary"
      size="icon"
      className="size-10"
      aria-label="Open Kilian's LinkedIn profile in a new tab"
      onClick={handleClick}>
      <LinkedInIcon className="size-5" />
    </LinkButton>
  )
}
