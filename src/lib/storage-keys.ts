/**
 * Centralized storage keys for localStorage, sessionStorage, and cookies
 * This ensures consistency and prevents typos across the codebase
 */

// ===== localStorage Keys =====
export const LOCAL_STORAGE_KEYS = {
  // Achievements
  ACHIEVEMENTS: 'kil.dev/achievements/v1',

  // Theme
  THEME: 'theme',
  THEME_UPDATED_AT: 'theme_updatedAt',

  // Feature Flags / Achievement Triggers
  MATRIX_THEME_SELECTED: 'kd_matrix_theme_selected',
  CONSOLE_OPENED: 'kd_console_opened',

  // Theme Preferences
  SEASONAL_OVERLAYS_ENABLED: 'seasonalOverlaysEnabled',
  DISABLE_SNOW: 'disableSnow',
  DISABLE_CODE_RAIN: 'disableCodeRain',
  DISABLE_GRID_LIGHTS: 'disableGridLights',
  DISABLE_THEME_HEADSHOT: 'disableThemeHeadshot',

  // Review
  REVIEW: 'kil.dev/review/v1',
} as const

// ===== sessionStorage Keys =====
export const SESSION_STORAGE_KEYS = {
  // Achievement UI State
  ACHIEVEMENTS_NAV_SPARKLED: 'kd_achievements_nav_sparkled',
  PET_GALLERY_NAV_SPARKLED: 'kd_pet_gallery_nav_sparkled',

  // Detection Events
  LADYBIRD_DETECTED_EVENT: 'ladybird_detected_event',

  // Animations
  KONAMI_ANIMATED: 'konami-animated',
} as const

// ===== Cookie Keys =====
export const COOKIE_KEYS = {
  // Theme (mirrored from localStorage)
  THEME: LOCAL_STORAGE_KEYS.THEME,
  THEME_UPDATED_AT: LOCAL_STORAGE_KEYS.THEME_UPDATED_AT,
  SYSTEM_THEME: 'systemTheme',

  // Theme Preferences (mirrored from localStorage)
  SEASONAL_OVERLAYS_ENABLED: LOCAL_STORAGE_KEYS.SEASONAL_OVERLAYS_ENABLED,
  DISABLE_THEME_HEADSHOT: LOCAL_STORAGE_KEYS.DISABLE_THEME_HEADSHOT,

  // Achievements (mirrored from localStorage for SSR)
  ACHIEVEMENTS: LOCAL_STORAGE_KEYS.ACHIEVEMENTS,
} as const
