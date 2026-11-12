import type { QuickFact } from '@/types/quick-facts'
import Link from 'next/link'
import { ModeToggleLink, ModeToggleNote } from './mode-toggle-link'

interface QuickFactProps {
  fact: QuickFact
}

export function QuickFactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] items-baseline gap-3 border-b border-border/60 py-2.5 compact:py-1.5">
      <dt className="text-sm display-text text-coin">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  )
}

export function QuickFact({ fact }: QuickFactProps) {
  return (
    <QuickFactRow label={fact.label}>
      {fact.label === 'Mode' ? (
        <>
          <ModeToggleLink /> <ModeToggleNote />
        </>
      ) : typeof fact.value === 'string' && fact.href ? (
        <>
          <Link
            href={fact.href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-primary">
            {fact.value}
          </Link>{' '}
          {fact.note ? <span className="text-xs font-normal text-muted-foreground">{fact.note}</span> : null}
        </>
      ) : (
        <>
          {fact.value}
          {fact.note ? (
            <>
              {' '}
              <span className="text-xs font-normal text-muted-foreground">{fact.note}</span>
            </>
          ) : null}
        </>
      )}
    </QuickFactRow>
  )
}
