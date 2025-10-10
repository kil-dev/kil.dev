import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'

/**
 * Check if the Matrix theme has been unlocked (selected at least once)
 * This check is safe for both client and server environments
 */
export function isMatrixThemeUnlocked(): boolean {
  return typeof localStorage !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_KEYS.MATRIX_THEME_SELECTED) === '1'
}
