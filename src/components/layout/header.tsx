import { AchievementScore } from '@/components/layout/header/achievement-score'
import { GitHubButton } from '@/components/layout/header/github-button'
import { HomeLogo } from '@/components/layout/header/home-logo'
import { LinkedInButton } from '@/components/layout/header/linkedin-button'
import { MobileNav } from '@/components/layout/header/mobile-nav'
import { NavLava } from '@/components/layout/header/nav-lava'
import { PAGE_GUTTER } from '@/components/ui/page-shell'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ThemeToggleFallback } from '@/components/ui/theme-toggle-fallback'
import { Suspense } from 'react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-primary whitespace-nowrap text-primary-foreground">
      {/* Slime hanging off the bottom edge; the drips slowly lengthen and shorten */}
      <div aria-hidden className="slime-drip pointer-events-none absolute top-full left-0 h-5 w-full text-primary">
        <svg aria-hidden className="absolute top-0 left-0 h-5 w-full">
          <pattern id="header-drip" width="260" height="20" patternUnits="userSpaceOnUse">
            <path
              fill="currentColor"
              className="slime-ooze"
              d="M0 0h260v3c-12 0-14 9-24 9s-12-9-26-9-16 15-27 15-9-15-24-15-18 6-30 6-14-6-28-6-13 11-23 11-11-11-25-11-17 4-26 4S10 3 0 3z"
            />
          </pattern>
          <rect width="100%" height="20" fill="url(#header-drip)" />
        </svg>
      </div>
      <div className={`grid grid-cols-[1fr_auto_1fr] items-center py-3 md:py-4 ${PAGE_GUTTER}`}>
        <div className="justify-self-start">
          <div className="flex items-center gap-2">
            <MobileNav />
            <HomeLogo />
          </div>
        </div>
        <div className="justify-self-center">
          <NavLava />
        </div>
        <div className="flex items-center gap-1 justify-self-end sm:gap-2">
          <AchievementScore />
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
