'use client'

import * as React from 'react'

// Tweakable speed control: number of rows each drop advances per second.
// Increase for faster rain; decrease for slower. Example: 24 is fairly chill; 60 ≈ 1 row/frame @60fps.
const MATRIX_RAIN_SPEED_ROWS_PER_SECOND = 10
// Trail decay calibrated per ROW advanced (not per frame). Smaller value = longer trails.
// Recommended range: 0.02 (very long) – 0.12 (short).
const MATRIX_RAIN_TRAIL_ALPHA_PER_ROW = 0.1
// Chance per second that any given trail cell mutates its character while stationary
const MATRIX_RAIN_TRAIL_MUTATION_PROB_PER_SECOND = 0.5
// Per-column speed variance (±fraction of base speed)
const MATRIX_RAIN_COLUMN_SPEED_VARIANCE = 0.35
// Tiny, per-frame random jitter applied to each column's speed (fraction per second)
const MATRIX_RAIN_COLUMN_JITTER_PER_SECOND = 0.15
// Fixed glyph size to keep rune size consistent across navigations/resizes
const MATRIX_RAIN_FONT_SIZE_PX = 16

function getContainerSize(el: HTMLElement | null): { width: number; height: number } {
  if (!el) return { width: globalThis.window.innerWidth, height: globalThis.window.innerHeight }
  const rect = el.getBoundingClientRect()
  return { width: Math.round(rect.width), height: Math.round(rect.height) }
}

// Render a Matrix-style falling code animation on a canvas
export function MatrixRain() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    if (typeof globalThis === 'undefined') return

    const prefersReducedMotion = globalThis.window?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
    if (prefersReducedMotion) return

    const container = containerRef.current
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
    if (!ctx) return
    const renderCtx: CanvasRenderingContext2D = ctx

    // Use device pixel ratio for crisp rendering
    const dpr = Math.max(1, Math.round(globalThis.window?.devicePixelRatio || 1))

    // Character/glyph setup
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'
    let fontSize = MATRIX_RAIN_FONT_SIZE_PX
    let columns = 0
    let drops: number[] = [] // current fractional row position per column
    let lastDrawnRow: number[] = [] // last integer row drawn per column
    let trailRowsByColumn: number[][] = [] // recent rows for each column to support mutations
    let maxTrackedTrailRows = 0
    let speedFactorByColumn: number[] = [] // per-column speed multiplier

    // Colors – use a close Matrix-like green; canvas does not reliably parse oklch()
    const glyphColor = 'rgb(20, 255, 120)'

    function resize() {
      if (!canvas) return
      const { width, height } = getContainerSize(container)
      const cWidth = Math.max(1, Math.floor(width))
      const cHeight = Math.max(1, Math.floor(height))

      // Snapshot previous canvas content to avoid losing trails on resize
      const prev = document.createElement('canvas')
      prev.width = canvas.width
      prev.height = canvas.height
      try {
        const pctx = prev.getContext('2d')
        pctx?.drawImage(canvas, 0, 0)
      } catch {}

      canvas.width = cWidth * dpr
      canvas.height = cHeight * dpr
      canvas.style.width = cWidth + 'px'
      canvas.style.height = cHeight + 'px'
      // Set DPR transform for CSS-unit drawing
      renderCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Keep a fixed glyph size for consistency across pages
      fontSize = MATRIX_RAIN_FONT_SIZE_PX
      renderCtx.font = `${fontSize}px "Matrix Code NFI", monospace`
      renderCtx.textBaseline = 'top'

      const newColumns = Math.max(1, Math.ceil(cWidth / fontSize))
      if (columns === 0) {
        // Initial setup
        columns = newColumns
        drops = Array.from({ length: columns }, () => -Math.random() * 40)
        lastDrawnRow = drops.map(v => Math.floor(v))
        maxTrackedTrailRows = Math.min(
          120,
          Math.max(24, Math.round((1 / Math.max(0.01, MATRIX_RAIN_TRAIL_ALPHA_PER_ROW)) * 8)),
        )
        trailRowsByColumn = Array.from({ length: columns }, () => [])
        speedFactorByColumn = Array.from({ length: columns }, () => {
          const delta = (Math.random() * 2 - 1) * MATRIX_RAIN_COLUMN_SPEED_VARIANCE
          return Math.max(0.2, 1 + delta)
        })
      } else {
        // Preserve existing columns/streams; add/remove as needed
        if (newColumns > columns) {
          for (let i = columns; i < newColumns; i++) {
            const start = -Math.random() * 40
            drops[i] = start
            lastDrawnRow[i] = Math.floor(start)
            trailRowsByColumn[i] = []
            const delta = (Math.random() * 2 - 1) * MATRIX_RAIN_COLUMN_SPEED_VARIANCE
            speedFactorByColumn[i] = Math.max(0.2, 1 + delta)
          }
        } else if (newColumns < columns) {
          drops.length = newColumns
          lastDrawnRow.length = newColumns
          trailRowsByColumn.length = newColumns
          speedFactorByColumn.length = newColumns
        }
        columns = newColumns
        maxTrackedTrailRows = Math.min(
          120,
          Math.max(24, Math.round((1 / Math.max(0.01, MATRIX_RAIN_TRAIL_ALPHA_PER_ROW)) * 8)),
        )
      }

      // Restore prior raster at the SAME CSS size it previously occupied to avoid glyph scaling
      try {
        renderCtx.imageSmoothingEnabled = false
        const prevCssW = prev.width / dpr
        const prevCssH = prev.height / dpr
        renderCtx.drawImage(prev, 0, 0, prev.width, prev.height, 0, 0, prevCssW, prevCssH)
      } catch {}
    }

    function drawGlyph(x: number, y: number) {
      renderCtx.fillStyle = 'rgba(0, 0, 0, 1)'
      renderCtx.fillRect(x, y, fontSize, fontSize)
      renderCtx.fillStyle = glyphColor
      const char = alphabet.charAt(Math.floor(Math.random() * alphabet.length))
      renderCtx.fillText(char, x, y)
    }

    function advanceColumn(i: number, rowsAdvance: number, dt: number) {
      const x = i * fontSize
      const jitter = (Math.random() * 2 - 1) * MATRIX_RAIN_COLUMN_JITTER_PER_SECOND * dt
      const columnAdvance = rowsAdvance * Math.max(0.05, speedFactorByColumn[i]! + jitter)
      drops[i]! += columnAdvance
      const targetRow = Math.floor(drops[i]!)
      let steps = targetRow - lastDrawnRow[i]!

      while (steps > 0) {
        const rowIndex = lastDrawnRow[i]! + 1
        const y = rowIndex * fontSize
        drawGlyph(x, y)
        lastDrawnRow[i] = rowIndex
        trailRowsByColumn[i]!.push(rowIndex)
        if (trailRowsByColumn[i]!.length > maxTrackedTrailRows) trailRowsByColumn[i]!.shift()
        steps--
      }
    }

    function mutateTrail(i: number, mutateP: number) {
      if (trailRowsByColumn[i]!.length === 0 || mutateP <= 0) return
      const attempts = Math.min(2, trailRowsByColumn[i]!.length)
      const x = i * fontSize
      for (let k = 0; k < attempts; k++) {
        if (Math.random() < mutateP) {
          const idx = Math.floor(Math.random() * trailRowsByColumn[i]!.length)
          const rowIndex = trailRowsByColumn[i]![idx]!
          const y = rowIndex * fontSize
          drawGlyph(x, y)
        }
      }
    }

    function maybeResetDrop(i: number, height: number) {
      const y = drops[i]! * fontSize
      if (y <= height || Math.random() <= 0.975) return
      drops[i] = -Math.random() * 30
      lastDrawnRow[i] = Math.floor(drops[i])
      trailRowsByColumn[i] = []
    }

    resize()

    let raf = 0
    let lastTs = globalThis.performance?.now() ?? Date.now()
    function draw() {
      const { width, height } = getContainerSize(container)
      const now = globalThis.performance?.now() ?? Date.now()
      const dt = Math.min(0.1, Math.max(0.001, (now - lastTs) / 1000)) // clamp to avoid big jumps
      lastTs = now
      // Compute rows advanced this frame, then fade proportional to rows to keep
      // trail length consistent regardless of speed or FPS.
      const rowsAdvance = MATRIX_RAIN_SPEED_ROWS_PER_SECOND * dt
      const fadeAlpha = 1 - Math.pow(1 - MATRIX_RAIN_TRAIL_ALPHA_PER_ROW, rowsAdvance)
      const fade = Math.max(0, Math.min(1, fadeAlpha))
      // Soft fade to create trails
      renderCtx.fillStyle = `rgba(0, 0, 0, ${fade})`
      renderCtx.fillRect(0, 0, width, height)

      renderCtx.fillStyle = glyphColor
      renderCtx.font = `${fontSize}px "Matrix Code NFI", monospace`

      // Per-frame mutation probability derived from per-second rate
      const mutateP = 1 - Math.pow(1 - MATRIX_RAIN_TRAIL_MUTATION_PROB_PER_SECOND, dt)

      for (let i = 0; i < columns; i++) {
        advanceColumn(i, rowsAdvance, dt)
        mutateTrail(i, mutateP)
        maybeResetDrop(i, height)
      }

      raf = globalThis.requestAnimationFrame(draw)
    }

    raf = globalThis.requestAnimationFrame(draw)
    const onResize = () => resize()
    globalThis.addEventListener('resize', onResize)

    // Also observe container size changes that happen due to layout/routing,
    // which don't trigger window resize events.
    let ro: ResizeObserver | undefined
    try {
      if (container) {
        ro = new ResizeObserver(() => resize())
        ro.observe(container)
      }
    } catch {}

    return () => {
      globalThis.cancelAnimationFrame(raf)
      globalThis.removeEventListener('resize', onResize)
      try {
        ro?.disconnect()
      } catch {}
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 z-0" aria-hidden>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
    </div>
  )
}
