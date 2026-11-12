import { ImagesPreload } from '@/components/ui/images-preload'
import { PageShell } from '@/components/ui/page-shell'
import { PETS } from '@/lib/pets'
import { PetsContentClient } from './content-client'

export function PetsContent() {
  const images = PETS.map(pet => pet.image)

  return (
    <PageShell section="pets" title="Pets" description="These are my pets">
      <ImagesPreload images={images} dataPreload="pets" />
      <PetsContentClient pets={PETS} />
    </PageShell>
  )
}
