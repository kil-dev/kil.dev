import Link from 'next/link'
import { Suspense } from 'react'
import { FooterClient } from './footer-client'
import { FooterYear } from './footer/footer-year'
import { FooterYearFallback } from './footer/footer-year-fallback'

export function Footer() {
  return (
    <footer className="w-full bg-background/50 border-t border-border">
      <div className="px-10 py-4">
        <div className="text-center text-sm text-muted-foreground">
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
