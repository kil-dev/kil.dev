'use client'

import { useAchievements } from '@/components/providers/achievements-provider'
import { Picker } from '@/components/ui/picker'
import { capturePetSelected } from '@/hooks/posthog'
import type { AchievementId } from '@/lib/achievements'
import type { Pet } from '@/types/pets'
import { formatAgeLabel, formatDateFull } from '@/utils/utils'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

interface PetsContentClientProps {
  pets: Pet[]
}

/** Pick a pet to see it. Viewing every pet unlocks PET_PARADE; the first one starts viewed. */
export function PetsContentClient({ pets }: PetsContentClientProps) {
  const { unlock, has } = useAchievements()
  const viewedRef = useRef(new Set(pets[0] ? [pets[0].id] : []))

  function handleSelect(pet: Pet) {
    capturePetSelected(pet.id)
    viewedRef.current.add(pet.id)
    if (viewedRef.current.size === pets.length && !has('PET_PARADE')) {
      unlock('PET_PARADE' satisfies AchievementId)
    }
  }

  return (
    <Picker
      items={pets}
      name="pet"
      legend="Choose a pet"
      label={pet => pet.name}
      avatar={pet => <Image src={pet.image} alt="" fill sizes="36px" className="object-cover" />}
      onSelect={handleSelect}>
      {pet => (
        <div className="grid content-start gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] md:gap-8 compact:gap-4! sm:compact:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]!">
          {/* On a phone the photo is full width and takes whatever height the text leaves */}
          <div className="relative aspect-4/3 overflow-hidden slime-frame max-sm:aspect-auto max-sm:h-[max(7rem,calc(100dvh-var(--frame-top)-var(--frame-bottom)-19rem))]">
            <Image
              src={pet.image}
              alt={pet.imageAlt}
              fill
              sizes="(max-width: 1024px) 80vw, 32rem"
              placeholder="blur"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-3 max-sm:grid max-sm:grid-cols-[auto_1fr] max-sm:items-start max-sm:gap-x-6 max-sm:gap-y-2">
            <h3 className="text-3xl leading-none font-black tracking-tight compact:text-xl">{pet.name}</h3>
            <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-1 text-sm">
              <dt className="display-text text-coin">Breed</dt>
              <dd>{pet.breed}</dd>
              <dt className="display-text text-coin">Gender</dt>
              <dd>{pet.gender}</dd>
              <dt className="display-text text-coin">Born</dt>
              <dd>
                <BirthdayWithAge birthday={pet.birthday} />
              </dd>
            </dl>
            <p className="leading-relaxed text-muted-foreground max-sm:col-span-2 compact:text-sm">{pet.description}</p>
          </div>
        </div>
      )}
    </Picker>
  )
}

function BirthdayWithAge({ birthday }: Readonly<{ birthday: string }>) {
  const [ageLabel, setAgeLabel] = useState<string | null>(null)
  useEffect(() => {
    setAgeLabel(formatAgeLabel(birthday))
  }, [birthday])
  return (
    <>
      {formatDateFull(birthday)}
      {ageLabel === null ? null : ` (${ageLabel})`}
    </>
  )
}
