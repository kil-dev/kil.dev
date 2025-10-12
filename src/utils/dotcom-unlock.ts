import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'

/**
 * Check if the Dotcom theme has been unlocked
 * Safe in both client and server contexts
 */
export function isDotcomThemeUnlocked(): boolean {
  return typeof localStorage !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_KEYS.DOTCOM_THEME_UNLOCKED) === '1'
}
