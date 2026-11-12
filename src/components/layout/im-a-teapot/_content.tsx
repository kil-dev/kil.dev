import Image from 'next/image'
import teapot from '../../../images/teapot.webp'
import { LinkButton } from '../../ui/link-button'
import { PAGE_GUTTER } from '../../ui/page-shell'

export function ImATeapotContent() {
  return (
    <div className={`flex flex-1 items-center justify-center py-20 ${PAGE_GUTTER}`}>
      <div className="w-full text-center">
        <div className="flex flex-col items-center gap-8">
          {/* Teapot Illustration */}
          <div className="group relative">
            <div className="relative h-52 w-52 md:h-72 md:w-72 lg:h-96 lg:w-96">
              <Image
                src={teapot}
                alt="A playful teapot illustration"
                fill
                sizes="(min-width: 1024px) 24rem, (min-width: 768px) 18rem, 13rem"
                className="object-contain"
                priority={true}
              />
            </div>
          </div>

          {/* Message */}
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl lg:text-5xl">
              I&apos;m a Teapot
            </h2>
            <p className="text-lg font-medium text-primary md:text-xl">
              This server is a teapot and refuses to brew coffee.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <LinkButton href="/" size="lg" aria-label="Return to home page">
              Go Home
            </LinkButton>
            <LinkButton
              href="https://good.store/collections/keats-and-co-loose-leaf-tea-and-coffee"
              external
              variant="secondary"
              size="lg"
              aria-label="Open Keats & Co loose-leaf tea and coffee collection in a new tab">
              Shop Tea
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  )
}
