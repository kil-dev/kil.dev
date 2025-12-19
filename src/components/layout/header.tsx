import { GitHubButton } from '@/components/layout/header/github-button'
import { HomeLogo } from '@/components/layout/header/home-logo'
import { LinkedInButton } from '@/components/layout/header/linkedin-button'
import { MobileNav } from '@/components/layout/header/mobile-nav'
import { NavLava } from '@/components/layout/header/nav-lava'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ThemeToggleFallback } from '@/components/ui/theme-toggle-fallback'
import { Suspense } from 'react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-solid border-border bg-background/90 whitespace-nowrap">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-6 md:px-10 md:py-8">
        <div className="justify-self-start">
          <div className="flex items-center gap-2">
            <MobileNav />
            <HomeLogo />
          </div>
        </div>
        <div className="justify-self-center">
          <NavLava />
        </div>
        <div className="flex items-center gap-3 justify-self-end">
          <Suspense fallback={<ThemeToggleFallback />}>
            <ThemeToggle />
          </Suspense>
          <GitHubButton />
          <LinkedInButton />
        </div>
      </div>
    </header>
  )
}
