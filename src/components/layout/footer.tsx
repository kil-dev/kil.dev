import Link from 'next/link'
import { FooterClient } from './footer-client'

export function Footer() {
  return (
    <footer className="w-full bg-background/50 border-t border-border">
      <div className="px-10 py-4">
        <div className="text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} <FooterClient /> — Steal this site (legally):{' '}
            <Link
              href="https://github.com/kiliantyler/kil.dev/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View GPLv3 license"
              className="hover:opacity-80">
              GPLv3
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
