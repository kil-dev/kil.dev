import { AboutContent } from '@/components/layout/about/_content'
import { KonamiCodeListener } from '@/components/layout/achievements/konami-code-listener'
import { ExperienceContent } from '@/components/layout/experience/_content'
import { HomeContent } from '@/components/layout/home/_content'
import { ProjectsContent } from '@/components/layout/projects/_content'
import { KonamiAnimationProvider } from '@/components/providers/konami-animation-provider'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kilian Tyler | Site Reliability Engineer',
}

export default function Homepage() {
  return (
    <KonamiAnimationProvider>
      <HomeContent>
        <AboutContent />
        <ExperienceContent />
        <ProjectsContent />
      </HomeContent>
      <KonamiCodeListener />
    </KonamiAnimationProvider>
  )
}
