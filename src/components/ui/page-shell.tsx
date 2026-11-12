import { cn } from '@/utils/utils'

/** Horizontal page gutter shared by the header, footer and every page. */
export const PAGE_GUTTER = 'px-5 sm:px-8 lg:px-12'

type PageShellProps = React.ComponentProps<'div'> & {
  title?: string
  description?: string
  actions?: React.ReactNode
  /** Anchor id when the shell is one page of the home page; its title becomes an h2. */
  section?: string
}

export function PageShell({ title, description, actions, section, children, className, ...props }: PageShellProps) {
  const Heading = section ? 'h2' : 'h1'
  // The page is exactly as tall as the space between header and footer. dvh, not svh: Safari's
  // bars collapse as you scroll, and a page sized for the small viewport lets the next one show.
  return (
    <div
      id={section}
      className={cn(
        PAGE_GUTTER,
        'flex min-h-[calc(100dvh-var(--frame-top)-var(--frame-bottom))] snap-start flex-col justify-center py-8 md:py-10 compact:justify-start! [@media(max-height:780px)]:py-4',
        className,
      )}
      {...props}>
      <div className="mx-auto w-full max-w-6xl">
        {/* Blur keeps text readable over the animated site background; it extends 1rem past the content */}
        <div className="-m-4 flex flex-col gap-8 rounded-3xl p-4 backdrop-blur-2xs [@media(max-height:780px)]:gap-5">
          {title ? (
            <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div className="flex flex-col gap-2">
                <Heading className="text-3xl leading-none font-black tracking-tight text-balance sm:text-4xl md:text-5xl">
                  {title}
                </Heading>
                {/* Dropped on short screens, where every line of height goes to the content */}
                {description ? (
                  <p className="text-muted-foreground [@media(max-height:620px)]:hidden">{description}</p>
                ) : null}
              </div>
              {actions}
            </header>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  )
}
