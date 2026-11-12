'use client'

import { CircuitBackground } from './background/circuit-background'
import { GradientOverlay } from './background/gradient-overlay'
import { MatrixRainLoader } from './background/matrix-rain-loader'
import { SlimeBubbles } from './background/slime-bubbles'
import { SlimeCritters } from './background/slime-critters'

export function Background() {
  return (
    <div aria-hidden>
      <SlimeBubbles />
      <CircuitBackground />
      <SlimeCritters />
      <MatrixRainLoader />
      <GradientOverlay />
    </div>
  )
}
