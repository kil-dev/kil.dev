import { PetGalleryContent } from '@/components/layout/pet-gallery/_content'
import { PageShell } from '@/components/ui/page-shell'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Pet Gallery | Kilian Tyler',
  description: 'A mosaic gallery of pet photos',
}

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
    <PageShell title="Pet Gallery" data-testid="pet-gallery-page">
      {/* The heading renders immediately; the heavy image loading streams in */}
      <Suspense fallback={<GalleryLoadingSkeleton />}>
        <PetGalleryContent />
      </Suspense>
    </PageShell>
  )
}
