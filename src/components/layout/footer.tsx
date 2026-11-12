import { PAGE_GUTTER } from '@/components/ui/page-shell'
import Link from 'next/link'
import { Suspense } from 'react'
import { FooterClient } from './footer-client'
import { FooterYear } from './footer/footer-year'
import { FooterYearFallback } from './footer/footer-year-fallback'
import { ScrollCue } from './footer/scroll-cue'

export function Footer() {
  return (
    <footer className="slime-pool fixed inset-x-0 bottom-0 z-40 flex h-[calc(var(--frame-bottom)-1.25rem)] items-center">
      <ScrollCue />
      <div className={`w-full ${PAGE_GUTTER}`}>
        <div className="text-center text-sm">
          <p>
            ©{' '}
            <Suspense fallback={<FooterYearFallback />}>
              <FooterYear />
            </Suspense>{' '}
            <FooterClient /> —{' '}
            <Link
              href="https://github.com/kiliantyler/kil.dev/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View GPLv3 license"
              className="hover:opacity-80">
              Steal this site (legally)
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
