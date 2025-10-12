/**
 * Injects a 90s-style chunked downward page load transition for View Transitions API
 * This uses a stepped clip-path wipe from top to bottom.
 */
function injectDotcomChunkLoadTransitionStyles(styleIdPrefix = 'dotcom-transition'): void {
  try {
    const styleId = `${styleIdPrefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @supports (view-transition-name: root) {
        ::view-transition-old(root) { animation: none; }
        ::view-transition-new(root) {
          animation: kd-dotcom-wipe-down 1500ms steps(24, end);
        }
        @keyframes kd-dotcom-wipe-down {
          from { clip-path: inset(0 0 100% 0); }
          to { clip-path: inset(0 0 0 0); }
        }
      }
    `
    document.head.append(style)
    setTimeout(() => {
      const el = document.getElementById(styleId)
      if (el) el.remove()
    }, 3000)
  } catch {}
}

/**
 * Execute an update function wrapped in a View Transition using the dotcom wipe styles.
 * Falls back to a direct update if the API is not available or Safari UA.
 */
export function startDotcomTransition(updateFn: () => void) {
  try {
    const ua = navigator.userAgent
    const isSafari =
      ua.includes('Safari/') &&
      !(ua.includes('Chrome/') || ua.includes('Chromium/') || ua.includes('Edg/') || ua.includes('OPR/'))
    const canUse = 'startViewTransition' in document && !isSafari
    if (!canUse) {
      updateFn()
      return
    }
    injectDotcomChunkLoadTransitionStyles()
    ;(document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(updateFn)
  } catch {
    updateFn()
  }
}
