'use client'

import { useAchievements } from '@/components/providers/achievements-provider'
import { useKonamiAnimation } from '@/components/providers/konami-animation-provider'
import { captureLadybirdDetected, captureProfileImageClicked } from '@/hooks/posthog'
import { useHash } from '@/hooks/use-hash'
import { useIsClient } from '@/hooks/use-is-client'
import * as Headshots from '@/images/headshot'
import { type AchievementId } from '@/lib/achievements'
import { HOME_CONTENT } from '@/lib/content'
import { SESSION_STORAGE_KEYS } from '@/lib/storage-keys'
import { themes } from '@/lib/themes'
import { recordBubblePop } from '@/utils/bubble-pops'
import { isLadybirdUA } from '@/utils/ladybird'
import { PROFILE_IMAGE_VARIANT_DATA_ATTRIBUTE } from '@/utils/profile-image-variant-script'
import { buildPerThemeVariantCss } from '@/utils/theme-css'
import { getThemeHeadshot } from '@/utils/themes'
import Image, { type StaticImageData } from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'

const GRUMPY_HOLD_MS = 2500

function getAnimationClass(isAnimating: boolean, hasAnimated: boolean, isReturning: boolean): string {
  if (isReturning) return 'konami-return-right'
  let classes = ''
  if (isAnimating) classes += 'konami-fly-right'
  if (hasAnimated) classes += (classes ? ' ' : '') + 'konami-complete konami-fly-right'
  return classes
}

export function ProfileImage() {
  const { isAnimating, hasAnimated, isReturning } = useKonamiAnimation()
  const { unlock, has } = useAchievements()
  const hash = useHash()
  const mounted = useIsClient()
  const [isImageLoaded, setIsImageLoaded] = useState(true)
  const useConfused = mounted && hash === '#YouWereAlreadyHere'
  const [isGrumpy, setIsGrumpy] = useState(false)
  // Clicking pops the portrait like a bubble; the grumpy face is what reforms in its place
  const [phase, setPhase] = useState<'idle' | 'popping' | 'reforming'>('idle')
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => clearTimeout(popTimer.current ?? undefined), [])
  // The grumpy face stays for at least GRUMPY_HOLD_MS, so moving the mouse away straight after
  // the click does not swap it back before it has been seen
  const pointerInside = useRef(false)
  const holding = useRef(false)
  const [isLadybird, setIsLadybird] = useState(() => {
    if (globalThis.window === undefined) return false
    return isLadybirdUA()
  })
  // Amongus variant is handled purely via CSS using the root data attribute

  type ProfileVariant = 'grumpy' | 'ladybird' | 'confused' | 'default'
  type NonThemeVariant = Exclude<ProfileVariant, 'default'>

  const VARIANT_TO_IMAGE: Record<NonThemeVariant, StaticImageData> = {
    grumpy: Headshots.Grumpy,
    ladybird: Headshots.Ladybird,
    confused: Headshots.Confused,
  }

  function captureIfNotAlready() {
    try {
      const alreadyCaptured =
        globalThis.window.sessionStorage.getItem(SESSION_STORAGE_KEYS.LADYBIRD_DETECTED_EVENT) === '1'
      if (!alreadyCaptured) {
        captureLadybirdDetected(navigator.userAgent || '')
        globalThis.window.sessionStorage.setItem(SESSION_STORAGE_KEYS.LADYBIRD_DETECTED_EVENT, '1')
      }
    } catch {}
  }

  function computeVariant(isGrumpyFlag: boolean, isLadybirdFlag: boolean, useConfusedFlag: boolean): ProfileVariant {
    if (isGrumpyFlag) return 'grumpy'
    if (isLadybirdFlag) return 'ladybird'
    if (useConfusedFlag) return 'confused'
    return 'default'
  }

  useEffect(() => {
    if (isLadybird) {
      captureIfNotAlready()
      return
    }
    if (!isLadybirdUA()) return

    const id = requestAnimationFrame(() => {
      setIsLadybird(true)
      captureIfNotAlready()
    })
    return () => cancelAnimationFrame(id)
  }, [isLadybird])

  useEffect(() => {
    if (isLadybird && !has('LADYBIRD_LANDING' as AchievementId)) {
      unlock('LADYBIRD_LANDING' as AchievementId)
    }
    if (useConfused && !has('CONFUSED_CLICK' as AchievementId)) {
      unlock('CONFUSED_CLICK' as AchievementId)
    }
  }, [isLadybird, useConfused, has, unlock])

  // mounted now provided by useIsClient

  const popIntoGrumpy = useCallback(
    (trigger: 'click' | 'keyboard') => {
      if (isGrumpy || phase !== 'idle') return
      setPhase('popping')
      recordBubblePop() // the portrait is a bubble too
      const popMs = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 280
      popTimer.current = setTimeout(() => {
        setIsGrumpy(true)
        setPhase('reforming')
        holding.current = true
        popTimer.current = setTimeout(() => {
          holding.current = false
          if (!pointerInside.current) setIsGrumpy(false)
        }, GRUMPY_HOLD_MS)
        captureProfileImageClicked(trigger, 'grumpy', useConfused)
        if (!has('GRUMPY_GLIMPSE' as AchievementId)) {
          unlock('GRUMPY_GLIMPSE' as AchievementId)
        }
      }, popMs)
    },
    [isGrumpy, phase, useConfused, has, unlock],
  )

  const handleClick = useCallback(() => popIntoGrumpy('click'), [popIntoGrumpy])

  const handlePointerLeave = useCallback(() => {
    pointerInside.current = false
    if (!holding.current) setIsGrumpy(false)
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      popIntoGrumpy('keyboard')
    },
    [popIntoGrumpy],
  )
  const variant = computeVariant(isGrumpy, isLadybird, useConfused)
  let imageSrc: StaticImageData = getThemeHeadshot('light')
  if (variant !== 'default') {
    imageSrc = VARIANT_TO_IMAGE[variant]
  }
  const altSuffix = variant === 'default' ? 'headshot' : variant
  const imageAlt = `${HOME_CONTENT.NAME} ${altSuffix}`

  const isEnvDrivenVariant = variant === 'ladybird' || variant === 'confused'
  const isBaseThemeVariant = !isGrumpy && !isLadybird && !useConfused

  useEffect(() => {
    if (!mounted) return
    const id = requestAnimationFrame(() => {
      if (isEnvDrivenVariant) {
        setIsImageLoaded(false)
      } else {
        setIsImageLoaded(true)
      }
    })
    return () => cancelAnimationFrame(id)
  }, [mounted, isEnvDrivenVariant])

  const profileImgCss = useMemo(() => {
    const base = buildPerThemeVariantCss({
      baseSelector: '.profile-img',
      variantAttr: 'data-theme',
      display: 'block',
    })
    const toggle = `\nhtml[${PROFILE_IMAGE_VARIANT_DATA_ATTRIBUTE}="amongus"] .profile-img{display:none!important}\nhtml[${PROFILE_IMAGE_VARIANT_DATA_ATTRIBUTE}="amongus"] .amongus-img{display:block!important}`
    const nonBase = themes.map(t => t.name).filter(n => n !== 'light' && n !== 'dark')
    const disableRules = nonBase
      .map(n => `html[data-disable-theme-headshot="1"].${n} .profile-img[data-theme="${n}"]{display:none!important}`)
      .join('\n')
    const fallbackRules = nonBase
      .map(n => `html[data-disable-theme-headshot="1"].${n} .profile-img[data-theme="light"]{display:block!important}`)
      .join('\n')
    return base + toggle + '\n' + disableRules + '\n' + fallbackRules
  }, [])

  return (
    <button
      type="button"
      // The portrait is as wide as the screen's height allows, so the name always fits with it
      className={`group relative order-1 mx-auto w-full max-w-[min(17rem,calc(100svh-23.5rem))] select-none min-[560px]:order-2 min-[560px]:mx-0 min-[560px]:max-w-[min(28rem,calc(100svh-13rem))] min-[560px]:justify-self-end ${getAnimationClass(isAnimating, hasAnimated, isReturning)}`}
      aria-pressed={isGrumpy}
      aria-label="Toggle grumpy profile image"
      onClick={handleClick}
      onPointerEnter={() => {
        pointerInside.current = true
      }}
      onKeyDown={handleKeyDown}
      onPointerLeave={handlePointerLeave}
      onMouseLeave={handlePointerLeave}
      onBlur={handlePointerLeave}>
      {phase === 'popping' && <span aria-hidden className="avatar-spray" />}
      <div
        onAnimationEnd={event => {
          if (event.animationName === 'kd-avatar-reform') setPhase('idle')
        }}
        className={phase === 'idle' ? undefined : phase === 'popping' ? 'avatar-pop' : 'avatar-reform'}>
        <div
          className="relative aspect-square w-full slime-blob overflow-hidden shadow-[0_0_0_5px_color-mix(in_oklch,var(--primary)_75%,transparent),0_30px_70px_-25px_var(--primary)] transition-[scale] duration-500 ease-jelly group-hover:scale-[1.03]"
          aria-busy={mounted && isEnvDrivenVariant && !isImageLoaded}>
          <style>{profileImgCss}</style>
          {themes.map(t => (
            <Image
              key={t.name}
              alt={imageAlt}
              src={getThemeHeadshot(t.name)}
              data-theme={t.name}
              className="profile-img translate-y-0 scale-100 transform-gpu transition-transform duration-500 ease-(--ease-fluid) group-hover:-translate-y-1 group-hover:scale-105"
              loading={t.name === 'light' || t.name === 'dark' ? 'eager' : 'lazy'}
              priority={t.name === 'light' || t.name === 'dark'}
              fill
              sizes="(min-width: 1024px) 500px, 100vw"
            />
          ))}

          {mounted && !isBaseThemeVariant && (
            <Image
              alt={imageAlt}
              src={imageSrc}
              className={`${isEnvDrivenVariant && !isImageLoaded ? 'opacity-0' : 'opacity-100'} translate-y-0 scale-100 transform-gpu transition-transform duration-500 ease-(--ease-fluid) group-hover:-translate-y-1 group-hover:scale-105`}
              loading="eager"
              priority
              fill
              sizes="(min-width: 1024px) 500px, 100vw"
              onLoad={() => setIsImageLoaded(true)}
            />
          )}

          {/* Always render Amongus overlay; CSS shows when root has data attribute */}
          <Image
            alt={`${HOME_CONTENT.NAME} amongus`}
            src={Headshots.Amongus}
            className="amongus-img hidden translate-y-0 scale-100 transform-gpu transition-transform duration-500 ease-(--ease-fluid) group-hover:-translate-y-1 group-hover:scale-105"
            loading="eager"
            priority
            fill
            sizes="(min-width: 1024px) 500px, 100vw"
            aria-hidden
            role="presentation"
          />
        </div>
      </div>
    </button>
  )
}
