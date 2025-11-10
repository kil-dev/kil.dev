'use client'

import { CircuitBackground } from './background/circuit-background'
import { GradientOverlay } from './background/gradient-overlay'
import { MatrixRainLoader } from './background/matrix-rain-loader'

export function Background() {
  return (
    <div aria-hidden>
      <CircuitBackground />
      <MatrixRainLoader />
      <GradientOverlay />
    </div>
  )
}
