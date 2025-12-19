import type { QuickFact } from '@/types/quick-facts'
import Link from 'next/link'
import { ModeToggleLink, ModeToggleNote } from './mode-toggle-link'

interface QuickFactProps {
  fact: QuickFact
}

export function QuickFact({ fact }: QuickFactProps) {
  return (
    <div key={fact.label} className="grid grid-cols-[auto_1fr] items-baseline gap-3">
      <dt className="text-muted-foreground">{fact.label}</dt>
      <dd className="font-medium text-primary">
        {fact.label === 'Mode' ? (
          <>
            <ModeToggleLink /> <ModeToggleNote />
          </>
        ) : typeof fact.value === 'string' && fact.href ? (
          <>
            <Link href={fact.href} target="_blank" rel="noopener noreferrer">
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
      </dd>
    </div>
  )
}
