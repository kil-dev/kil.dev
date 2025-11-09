import { CircuitBackground } from './background/circuit-background'
import { GradientOverlay } from './background/gradient-overlay'
import { MatrixRainLoader } from './background/matrix-rain-loader'

export function Background() {
  return (
    <div suppressHydrationWarning aria-hidden>
      <CircuitBackground />
      {/* Matrix rain mounts client-side only when the Matrix theme is active */}
      <MatrixRainLoader />
      <GradientOverlay />
    </div>
  )
}
