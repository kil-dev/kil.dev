import { PetGalleryContent } from '@/components/layout/pet-gallery/_content'
import { SectionLabel } from '@/components/ui/section-label'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Pet Gallery | Kilian Tyler',
  description: 'A mosaic gallery of pet photos',
}

export const experimental_ppr = true

function GalleryLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg bg-muted"
          style={{
            aspectRatio: '1',
            animationDelay: `${(i % 6) * 50}ms`,
          }}
        />
      ))}
    </div>
  )
}

export default function PetGalleryPage() {
  return (
    <div className="px-10 py-16 md:px-20 lg:px-40">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        {/* Show header immediately - no waiting */}
        <div className="flex flex-col gap-2">
          <SectionLabel as="p">Pet gallery</SectionLabel>
        </div>

        {/* Stream in the heavy image loading */}
        <Suspense fallback={<GalleryLoadingSkeleton />}>
          <PetGalleryContent />
        </Suspense>
      </div>
    </div>
  )
}
