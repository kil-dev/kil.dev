import { shouldCapturePostHogEvents } from '@/lib/posthog-config'
import { isDev } from '@/utils/utils'
import type { Route } from 'next'

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const canCapture = shouldCapturePostHogEvents({
  isDevRuntime: isDev(),
  posthogDisabled: process.env.NEXT_PUBLIC_POSTHOG_DISABLED,
  posthogKey,
})

// Centralized event property names for consistent usage across all PostHog events
enum PostHogEventProperties {
  PLATFORM = 'platform',
  HREF = 'href',
  THEME = 'theme',
  PROJECT_ID = 'projectId',
  SOURCE = 'source',
  INTERACTION = 'interaction',
  NEW_STATE = 'newState',
  WAS_CONFUSED = 'wasConfused',
  PET_ID = 'petId',
  USER_AGENT = 'userAgent',
  COMPANY_ID = 'companyId',
  ACHIEVEMENT_ID = 'achievementId',
}

// Lazy load posthog to avoid blocking initial render
async function getPostHog() {
  if (!canCapture) return null
  try {
    const { default: posthog } = await import('posthog-js')
    return posthog
  } catch {
    return null
  }
}

export function captureSocialLinkClicked(platform: string, href: Route) {
  if (!canCapture) return
  void getPostHog().then(posthog => {
    posthog?.capture('social_link_clicked', {
      [PostHogEventProperties.PLATFORM]: platform,
      [PostHogEventProperties.HREF]: href,
    })
  })
}

export function captureThemeChanged(theme: string) {
  if (!canCapture) return
  void getPostHog().then(posthog => {
    posthog?.capture('theme_changed', {
      [PostHogEventProperties.THEME]: theme,
    })
  })
}

export function captureProjectSourceClicked(projectId: string, source: Route) {
  if (!canCapture) return
  void getPostHog().then(posthog => {
    posthog?.capture('project_source_clicked', {
      [PostHogEventProperties.PROJECT_ID]: projectId,
      [PostHogEventProperties.SOURCE]: source,
    })
  })
}

export function captureProjectVisitClicked(projectId: string, href: Route) {
  if (!canCapture) return
  void getPostHog().then(posthog => {
    posthog?.capture('project_visit_clicked', {
      [PostHogEventProperties.PROJECT_ID]: projectId,
      [PostHogEventProperties.HREF]: href,
    })
  })
}

export function captureProfileImageClicked(interaction: string, newState: string, wasConfused: boolean) {
  if (!canCapture) return
  void getPostHog().then(posthog => {
    posthog?.capture('profile_image_clicked', {
      [PostHogEventProperties.INTERACTION]: interaction,
      [PostHogEventProperties.NEW_STATE]: newState,
      [PostHogEventProperties.WAS_CONFUSED]: wasConfused,
    })
  })
}

export function captureDarkModeEasterEgg() {
  if (!canCapture) return
  void getPostHog().then(posthog => {
    posthog?.capture('dark_mode_easter_egg')
  })
}

/** A pet was picked in the Pets list. Replaces `pet_card_flipped` from the flip-card design. */
export function capturePetSelected(petId: string) {
  if (!canCapture) return
  void getPostHog().then(posthog => {
    posthog?.capture('pet_selected', {
      [PostHogEventProperties.PET_ID]: petId,
    })
  })
}

export function captureLadybirdDetected(userAgent: string) {
  if (!canCapture) return
  void getPostHog().then(posthog => {
    posthog?.capture('ladybird_browser_detected', {
      [PostHogEventProperties.USER_AGENT]: userAgent,
    })
  })
}

/** A job was picked in the Experience list. Replaces `work_highlights_toggled` from the collapsible timeline. */
export function captureWorkExperienceSelected(companyId: string) {
  if (!canCapture) return
  void getPostHog().then(posthog => {
    posthog?.capture('work_experience_selected', {
      [PostHogEventProperties.COMPANY_ID]: companyId,
    })
  })
}

export function captureCompanyLogoClicked(companyId: string, companyUrl: Route) {
  if (!canCapture) return
  void getPostHog().then(posthog => {
    posthog?.capture('company_logo_clicked', {
      [PostHogEventProperties.COMPANY_ID]: companyId,
      [PostHogEventProperties.HREF]: companyUrl,
    })
  })
}

export function captureAchievementUnlocked(achievementId: string) {
  if (!canCapture) return
  void getPostHog().then(posthog => {
    posthog?.capture('achievement_unlocked', {
      [PostHogEventProperties.ACHIEVEMENT_ID]: achievementId,
    })
  })
}
