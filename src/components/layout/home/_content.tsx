'use client'

import { SnakeGameConvexProvider } from '@/components/providers/convex-provider'
import { useKonamiAnimation } from '@/components/providers/konami-animation-provider'
import { PAGE_GUTTER } from '@/components/ui/page-shell'
import dynamic from 'next/dynamic'
import { HeroContent } from './hero/hero-content'
import { ProfileImage } from './hero/profile-image'

const BackgroundSnakeGame = dynamic(() => import('./background-snake-game').then(m => m.BackgroundSnakeGame), {
  ssr: false,
})

export function HomeContent({ children }: { children?: React.ReactNode }) {
  const { startCrtAnimation } = useKonamiAnimation()

  return (
    <>
      {startCrtAnimation && (
        <SnakeGameConvexProvider>
          <BackgroundSnakeGame />
        </SnakeGameConvexProvider>
      )}
      <section
        className={`relative flex min-h-[calc(100dvh-var(--frame-top)-var(--frame-bottom))] snap-start items-center py-6 ${PAGE_GUTTER}`}>
        <div className="mx-auto w-full max-w-6xl text-center min-[560px]:text-left">
          {/* Side by side from 560px, so a wide but short screen still shows the name beside the
              portrait; stacked below that */}
          <div className="grid grid-cols-1 items-center gap-6 min-[560px]:grid-cols-2 min-[560px]:gap-10 lg:gap-16">
            <ProfileImage />
            <HeroContent />
          </div>
        </div>
      </section>
      {!startCrtAnimation && children}
    </>
  )
}
