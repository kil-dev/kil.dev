'use client'

import { useKonamiAnimation } from '@/components/providers/konami-animation-provider'
import { MapTooltip } from '@/components/ui/map-tooltip'
import { HOME_CONTENT } from '@/lib/content'

function getKonamiClasses(isAnimating: boolean, hasAnimated: boolean, isReturning: boolean): string {
  if (isReturning) return 'konami-return-left'
  if (hasAnimated) return 'konami-complete konami-fly-left'
  if (isAnimating) return 'konami-fly-left'
  return ''
}

export function HeroContent() {
  const { isAnimating, hasAnimated, isReturning } = useKonamiAnimation()

  return (
    <div
      className={`order-2 -m-4 flex flex-col gap-10 rounded-3xl p-4 backdrop-blur-2xs min-[560px]:order-1 ${getKonamiClasses(isAnimating, hasAnimated, isReturning)}`}>
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl leading-tight font-black tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {HOME_CONTENT.NAME}
        </h1>
        <p className="text-lg font-semibold text-primary md:text-xl">{HOME_CONTENT.TITLE}</p>
        <MapTooltip className="font-medium text-foreground underline decoration-border decoration-2 underline-offset-4 hover:decoration-primary" />
      </div>
    </div>
  )
}
