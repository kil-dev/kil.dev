'use client'

import { PROFILE_IMAGE_VARIANT_DATA_ATTRIBUTE } from '@/utils/profile-image-variant-script'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'

export function HomeLogo() {
  const shortContent = 'kil.dev'
  const longContent = 'Kilian.DevOps'

  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])
  const handleFocus = useCallback(() => setIsHovered(true), [])
  const handleBlur = useCallback(() => setIsHovered(false), [])

  const ariaLabel = useMemo(() => {
    return isHovered ? `{ ${longContent} }` : `{ ${shortContent} }`
  }, [isHovered, longContent, shortContent])

  return (
    <Link
      href="/"
      aria-label={ariaLabel}
      className="group flex cursor-pointer items-center gap-3 text-primary-foreground select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}>
      <div>
        {/* Default logo */}
        <h2 className="logo-default relative origin-left text-xl leading-tight font-bold whitespace-nowrap text-primary-foreground motion-safe:group-hover:animate-[kd-wobble_0.7s_var(--ease-jelly)] motion-safe:group-focus-visible:animate-[kd-wobble_0.7s_var(--ease-jelly)]">
          <span aria-hidden="true" className="inline-block -translate-y-[0.125rem]">
            {'{ '}
          </span>
          <span
            aria-hidden="true"
            className="relative inline-block max-w-[30ch] overflow-hidden align-top transition-[max-width] duration-250 ease-out">
            <span className="inline-block align-top">
              <span className="relative inline-block align-top">
                <span aria-hidden="true" className="invisible">
                  K
                </span>
                <span aria-hidden="true" className="absolute inset-0">
                  <span className="absolute top-0 left-0 origin-bottom scale-100 opacity-100 transition-all duration-300 ease-in group-hover:scale-y-50 group-hover:opacity-0">
                    k
                  </span>
                  <span className="absolute top-0 left-0 origin-bottom scale-50 opacity-0 transition-all duration-500 ease-jelly group-hover:scale-100 group-hover:opacity-100">
                    K
                  </span>
                </span>
              </span>
              <span aria-hidden="true">il</span>
              <span
                aria-hidden="true"
                className="inline-block max-w-0 overflow-hidden align-top transition-[max-width] duration-500 ease-jelly group-hover:max-w-[3ch] group-focus-visible:max-w-[3ch]">
                {/* Each new letter drips down into place, one after the other */}
                <span className="inline-block origin-top -translate-y-2 scale-y-[1.8] opacity-0 transition-all duration-500 ease-jelly group-hover:translate-y-0 group-hover:scale-y-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-y-100 group-focus-visible:opacity-100">
                  i
                </span>
                <span className="inline-block origin-top -translate-y-2 scale-y-[1.8] opacity-0 transition-all delay-75 duration-500 ease-jelly group-hover:translate-y-0 group-hover:scale-y-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-y-100 group-focus-visible:opacity-100">
                  a
                </span>
                <span className="inline-block origin-top -translate-y-2 scale-y-[1.8] opacity-0 transition-all delay-150 duration-500 ease-jelly group-hover:translate-y-0 group-hover:scale-y-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-y-100 group-focus-visible:opacity-100">
                  n
                </span>
              </span>
            </span>
            <span aria-hidden="true">.</span>
            <span className="inline-block align-top">
              <span className="relative inline-block align-top">
                <span aria-hidden="true" className="invisible">
                  D
                </span>
                <span aria-hidden="true" className="absolute inset-0">
                  <span className="absolute top-0 left-0 origin-bottom scale-100 opacity-100 transition-all duration-300 ease-in group-hover:scale-y-50 group-hover:opacity-0">
                    d
                  </span>
                  <span className="absolute top-0 left-0 origin-bottom scale-50 opacity-0 transition-all duration-500 ease-jelly group-hover:scale-100 group-hover:opacity-100">
                    D
                  </span>
                </span>
              </span>
              <span aria-hidden="true">ev</span>
              <span
                aria-hidden="true"
                className="inline-block max-w-0 overflow-hidden align-top transition-[max-width] duration-500 ease-jelly group-hover:max-w-[3ch] group-focus-visible:max-w-[3ch]">
                <span className="inline-block origin-top -translate-y-2 scale-y-[1.8] opacity-0 transition-all duration-500 ease-jelly group-hover:translate-y-0 group-hover:scale-y-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-y-100 group-focus-visible:opacity-100">
                  O
                </span>
                <span className="inline-block origin-top -translate-y-2 scale-y-[1.8] opacity-0 transition-all delay-75 duration-500 ease-jelly group-hover:translate-y-0 group-hover:scale-y-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-y-100 group-focus-visible:opacity-100">
                  p
                </span>
                <span className="inline-block origin-top -translate-y-2 scale-y-[1.8] opacity-0 transition-all delay-150 duration-500 ease-jelly group-hover:translate-y-0 group-hover:scale-y-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-y-100 group-focus-visible:opacity-100">
                  s
                </span>
              </span>
            </span>
          </span>
          <span
            aria-hidden="true"
            className="inline-block -translate-y-[0.125rem] transition-[margin] duration-250 ease-out will-change-[margin]">
            {' }'}
          </span>
        </h2>

        {/* Alt-domain Amongus logo: shows on html[data-profile-image-variant="amongus"] */}
        <h2 className="logo-amongus relative hidden text-xl leading-tight font-bold whitespace-nowrap text-primary-foreground">
          <span aria-hidden="true" className="inline-block -translate-y-[0.125rem]">
            {'{ '}
          </span>
          <span
            aria-hidden="true"
            className="relative inline-block max-w-[30ch] overflow-hidden align-top transition-[max-width] duration-250 ease-out">
            <span className="inline-block align-top">
              {/* First character swaps: ඞ -> a */}
              <span className="relative inline-block align-top">
                <span aria-hidden="true" className="invisible">
                  a
                </span>
                <span aria-hidden="true" className="absolute inset-0">
                  <span className="absolute top-0 left-0 translate-y-0 opacity-100 transition-all duration-500 ease-(--ease-fluid) group-hover:-translate-y-0.5 group-hover:opacity-0">
                    ඩ
                  </span>
                  <span className="absolute top-0 left-0 translate-y-0.5 opacity-0 transition-all duration-500 ease-(--ease-fluid) group-hover:translate-y-0 group-hover:opacity-100">
                    a
                  </span>
                </span>
              </span>
              {/* Remainder reveals: mongus */}
              <span
                aria-hidden="true"
                className="inline-block max-w-0 overflow-hidden align-top transition-[max-width] duration-500 ease-(--ease-fluid) group-hover:max-w-[6ch] group-focus-visible:max-w-[6ch]">
                <span>mongus</span>
              </span>
            </span>
            <span aria-hidden="true">.</span>
            <span className="inline-block align-top">
              <span aria-hidden="true">net</span>
            </span>
          </span>
          <span
            aria-hidden="true"
            className="inline-block -translate-y-[0.125rem] transition-[margin] duration-250 ease-out will-change-[margin]">
            {' }'}
          </span>
        </h2>

        <style>{`
          html[${PROFILE_IMAGE_VARIANT_DATA_ATTRIBUTE}="amongus"] .logo-default{display:none}
          html[${PROFILE_IMAGE_VARIANT_DATA_ATTRIBUTE}="amongus"] .logo-amongus{display:block}
        `}</style>
      </div>
    </Link>
  )
}
