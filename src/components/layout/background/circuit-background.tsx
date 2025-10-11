'use client'

import { LIGHT_GRID } from '@/lib/light-grid'
import dynamic from 'next/dynamic'

const GridLights = dynamic(() => import('./grid-lights').then(mod => ({ default: mod.GridLights })), {
  ssr: false,
  loading: () => null,
})

export function CircuitBackground() {
  return (
    <div
      className="absolute inset-0 z-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)]"
      style={{
        backgroundSize: `${LIGHT_GRID.GRID_SIZE_PX}px ${LIGHT_GRID.GRID_SIZE_PX}px`,
        backgroundPosition: `${LIGHT_GRID.GRID_OFFSET_PX}px ${LIGHT_GRID.GRID_OFFSET_PX}px`,
      }}
      aria-hidden>
      <GridLights />
    </div>
  )
}
