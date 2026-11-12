import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'

/** Fired on `window` after every pop; `detail` is the new running total. */
export const BUBBLE_POPPED_EVENT = 'kd:bubble-popped'

// Keeps the count going for this visit when storage is unavailable
let sessionPops = 0

/** Bubbles popped so far, counted across visits. */
export function readBubblePops(): number {
  try {
    return Number(localStorage.getItem(LOCAL_STORAGE_KEYS.BUBBLES_POPPED) ?? 0)
  } catch {
    return sessionPops
  }
}

/** Counts one more pop (a background bubble or the portrait) and announces the new total. */
export function recordBubblePop(): number {
  const total = readBubblePops() + 1
  sessionPops = total
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.BUBBLES_POPPED, String(total))
  } catch {
    // Counted for this visit only
  }
  globalThis.dispatchEvent(new CustomEvent(BUBBLE_POPPED_EVENT, { detail: total }))
  return total
}
