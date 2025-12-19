'use client'

import { SnakeGameConvexProvider } from '@/components/providers/convex-provider'
import { useKonamiAnimation } from '@/components/providers/konami-animation-provider'
import dynamic from 'next/dynamic'
import { HeroContent } from './hero/hero-content'
import { ProfileImage } from './hero/profile-image'

const BackgroundSnakeGame = dynamic(() => import('./background-snake-game').then(m => m.BackgroundSnakeGame), {
  ssr: false,
})

export function HomeContent() {
  const { startCrtAnimation } = useKonamiAnimation()

  return (
    <>
      {startCrtAnimation && (
        <SnakeGameConvexProvider>
          <BackgroundSnakeGame />
        </SnakeGameConvexProvider>
      )}
      <section className="flex min-h-[calc(100svh-14rem)] items-center px-10 py-20 md:min-h-[calc(100svh-16rem)] md:px-20 lg:px-40">
        <div className="mx-auto w-full max-w-7xl text-center lg:text-left">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <ProfileImage />
            <HeroContent />
          </div>
        </div>
      </section>
    </>
  )
}
