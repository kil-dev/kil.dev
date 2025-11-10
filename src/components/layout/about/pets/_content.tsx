import { SectionLabel } from '@/components/ui/section-label'
import { PETS } from '@/lib/pets'
import type { Pet } from '@/types/pets'
import Image from 'next/image'
import { PetsContentClient } from './content-client'

export function PetsContent() {
  return (
    <div className="mt-12 px-6">
      <SectionLabel className="mb-4">These are my pets</SectionLabel>
      <PetImagesPreload pets={PETS} />
      <PetsContentClient pets={PETS} />
    </div>
  )
}

interface PetImagesPreloadProps {
  pets: Pet[]
}

function PetImagesPreload({ pets }: PetImagesPreloadProps) {
  if (pets.length === 0) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
      data-preload="pets">
      {pets.map(pet => (
        <Image
          key={pet.id}
          src={pet.image}
          alt=""
          width={pet.image.width}
          height={pet.image.height}
          priority
          fetchPriority="high"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ))}
    </div>
  )
}
