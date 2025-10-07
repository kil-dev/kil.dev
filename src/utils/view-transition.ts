type ViewTransitionOptions = {
  originXPercent?: number
  originYPercent?: number
  disableOnSafari?: boolean
  styleIdPrefix?: string
}

function isSafariUA(): boolean {
  try {
    const ua = navigator.userAgent
    return (
      ua.includes('Safari/') &&
      !(ua.includes('Chrome/') || ua.includes('Chromium/') || ua.includes('Edg/') || ua.includes('OPR/'))
    )
  } catch {
    return false
  }
}

export function injectCircleBlurTransitionStyles(
  originXPercent: number,
  originYPercent: number,
  styleIdPrefix = 'theme-transition',
): void {
  try {
    const styleId = `${styleIdPrefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`
    const style = document.createElement('style')
    style.id = styleId
    const css = `
      @supports (view-transition-name: root) {
        ::view-transition-old(root) {
          animation: none;
        }
        ::view-transition-new(root) {
          animation: circle-blur-expand 0.5s ease-out;
          transform-origin: ${originXPercent}% ${originYPercent}%;
          filter: blur(0);
        }
        @keyframes circle-blur-expand {
          from {
            clip-path: circle(0% at ${originXPercent}% ${originYPercent}%);
            filter: blur(4px);
          }
          to {
            clip-path: circle(150% at ${originXPercent}% ${originYPercent}%);
            filter: blur(0);
          }
        }
      }
    `
    style.textContent = css
    document.head.append(style)
    setTimeout(() => {
      const styleEl = document.getElementById(styleId)
      if (styleEl) styleEl.remove()
    }, 3000)
  } catch {}
}

export function maybeStartViewTransition(updateFn: () => void, opts?: ViewTransitionOptions): boolean {
  try {
    const disableOnSafari = opts?.disableOnSafari ?? true
    const canUse = 'startViewTransition' in document && (!disableOnSafari || !isSafariUA())
    if (!canUse) return false
    const ox = opts?.originXPercent ?? 50
    const oy = opts?.originYPercent ?? 50
    injectCircleBlurTransitionStyles(ox, oy, opts?.styleIdPrefix)
    ;(document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(updateFn)
    return true
  } catch {
    return false
  }
}
