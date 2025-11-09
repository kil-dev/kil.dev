'use client'

import { PetCard } from '@/components/layout/about/pets/pet-card/_content'
import { useAchievements } from '@/components/providers/achievements-provider'
import type { AchievementId } from '@/lib/achievements'
import type { Pet } from '@/types/pets'
import { useCallback, useMemo, useRef, useState } from 'react'

interface PetsContentClientProps {
  pets: Pet[]
}

export function PetsContentClient({ pets }: PetsContentClientProps) {
  const { unlock, has } = useAchievements()
  const [, setFlippedPetIds] = useState<Set<string>>(new Set())
  const celebratedRef = useRef(false)

  const requiredPetIds = useMemo(() => new Set(pets.map(pet => pet.id)), [pets])

  const handlePetFlipChange = useCallback(
    (petId: string, flipped: boolean) => {
      setFlippedPetIds(prev => {
        const next = new Set(prev)
        if (flipped) {
          next.add(petId)
        }

        if (!flipped) return next

        for (const id of requiredPetIds) {
          if (!next.has(id)) {
            return next
          }
        }

        if (celebratedRef.current) return next
        celebratedRef.current = true

        if (has('PET_PARADE')) return next
        unlock('PET_PARADE' as AchievementId)
        return next
      })
    },
    [has, requiredPetIds, unlock],
  )

  if (pets.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {pets.map(pet => (
        <PetCard key={pet.id} pet={pet} onFlipChange={handlePetFlipChange} frontPriority />
      ))}
    </div>
  )
}
