import { LinkButton } from '@/components/ui/link-button'
import { PAGE_GUTTER } from '@/components/ui/page-shell'

export function NotFoundContent() {
  return (
    <div className={`flex flex-1 items-center justify-center py-20 ${PAGE_GUTTER}`}>
      <div className="w-full text-center">
        <div className="flex flex-col items-center gap-8">
          {/* 404 Number */}
          <h1 className="text-9xl leading-none font-black tracking-tight text-foreground md:text-[12rem] lg:text-[16rem]">
            404
          </h1>

          {/* Error Message */}
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Page Not Found
            </h2>
            <p className="text-lg font-medium text-primary md:text-xl">
              The page you&apos;re looking for seems to have vanished
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <LinkButton href="/" size="lg" aria-label="Return to home page">
              Go Home
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  )
}
