import { PetGalleryContent } from '@/components/layout/pet-gallery/_content'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pet Gallery | Kilian Tyler',
  description: 'A mosaic gallery of pet photos',
}

export const experimental_ppr = true

export default function PetGalleryPage() {
  return <PetGalleryContent />
}
