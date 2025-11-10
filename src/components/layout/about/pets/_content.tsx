import { ImagesPreload } from '@/components/ui/images-preload'
import { SectionLabel } from '@/components/ui/section-label'
import { PETS } from '@/lib/pets'
import { PetsContentClient } from './content-client'

export function PetsContent() {
  const images = PETS.map(pet => pet.image)

  return (
    <div className="mt-12 px-6">
      <SectionLabel className="mb-4">These are my pets</SectionLabel>
      <ImagesPreload images={images} dataPreload="pets" />
      <PetsContentClient pets={PETS} />
    </div>
  )
}
