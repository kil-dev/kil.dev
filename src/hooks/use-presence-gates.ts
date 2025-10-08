'use client'

import { useState } from 'react'

import { useAchievements } from '@/components/providers/achievements-provider'
import { useIsClient } from '@/hooks/use-is-client'

type PresenceGates = {
  allowAchievements: boolean
  allowPetGallery: boolean
}

export function usePresenceGates(): PresenceGates {
  const { has } = useAchievements()
  const isMounted = useIsClient()

  const [initialDomFlags] = useState(() => {
    if (typeof document === 'undefined') return { hasAchievements: false, hasPetGallery: false }
    const root = document.documentElement
    return {
      hasAchievements: root.dataset.hasAchievements === 'true',
      hasPetGallery: root.dataset.hasPetGallery === 'true',
    }
  })

  return {
    allowAchievements: initialDomFlags.hasAchievements || (isMounted && has('RECURSIVE_REWARD')),
    allowPetGallery: initialDomFlags.hasPetGallery || (isMounted && has('PET_PARADE')),
  }
}
