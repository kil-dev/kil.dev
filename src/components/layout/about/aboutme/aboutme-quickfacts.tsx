import { MapTooltip } from '@/components/ui/map-tooltip'
import { QUICK_FACTS } from '@/lib/quickfacts'
import { QuickFact, QuickFactRow } from './quick-fact'

export function AboutMeQuickFacts() {
  // Where the facts sit under the text and the screen is small, they are a page of their own:
  // the text fills one screen and the facts snap in as the next
  return (
    <dl className="grid content-start gap-x-10 sm:grid-cols-2 lg:grid-cols-1 lg:border-l-2 lg:border-border lg:pl-10 max-lg:compact:min-h-[calc(100dvh-var(--frame-top)-var(--frame-bottom))] max-lg:compact:snap-start max-lg:compact:content-center">
      <QuickFactRow label="Location">
        <MapTooltip className="text-foreground transition-colors hover:text-primary" />
      </QuickFactRow>
      {QUICK_FACTS.map(fact => (
        <QuickFact key={fact.label} fact={fact} />
      ))}
    </dl>
  )
}
