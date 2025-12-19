'use client'

import * as React from 'react'

import * as SwitchPrimitive from '@radix-ui/react-switch'
import { motion } from 'motion/react'

import { cn } from '@/utils/utils'

const SIZES = {
  sm: { TRACK_WIDTH: 26, THUMB_SIZE: 14, THUMB_STRETCH: 18 },
  md: { TRACK_WIDTH: 32, THUMB_SIZE: 16, THUMB_STRETCH: 25 },
  lg: { TRACK_WIDTH: 48, THUMB_SIZE: 24, THUMB_STRETCH: 40 },
} as const

const STRETCH_DURATION = 120 // ms

type Size = keyof typeof SIZES

interface SwitchProps extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  size?: Size
}

function Switch({ className, size = 'md', ...props }: SwitchProps) {
  const { TRACK_WIDTH, THUMB_SIZE, THUMB_STRETCH } = SIZES[size]
  const [isChecked, setIsChecked] = React.useState(props.checked ?? props.defaultChecked ?? false)
  const [isStretching, setIsStretching] = React.useState(false)
  const [hasMounted, setHasMounted] = React.useState(false)

  React.useEffect(() => {
    if (props.checked !== undefined) setIsChecked(props.checked)
  }, [props.checked])

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  React.useEffect(() => {
    if (!hasMounted) return
    setIsStretching(true)
    const timeout = setTimeout(() => setIsStretching(false), STRETCH_DURATION)
    return () => clearTimeout(timeout)
  }, [isChecked, hasMounted])

  const handleCheckedChange = (checked: boolean) => {
    setIsChecked(checked)
    props.onCheckedChange?.(checked)
  }

  const thumbWidth = isStretching ? THUMB_STRETCH : THUMB_SIZE
  const offsetUnchecked = 0
  const offsetChecked = TRACK_WIDTH - thumbWidth - 2

  const thumbLeft = isChecked ? offsetChecked : offsetUnchecked
  const disableInitialMotion = !hasMounted

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer relative inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
        // Dynamic width/height
        (() => {
          const sizeClassMap: Record<Size, string> = {
            sm: 'h-4 w-6.5',
            md: 'h-[1.15rem] w-8',
            lg: 'h-7 w-12',
          }
          return sizeClassMap[size] ?? sizeClassMap.md
        })(),
        className,
      )}
      {...props}
      checked={props.checked ?? isChecked}
      onCheckedChange={handleCheckedChange}>
      <SwitchPrimitive.Thumb asChild>
        <motion.span
          data-slot="switch-thumb"
          className={cn(
            'pointer-events-none absolute block rounded-full bg-background ring-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground',
          )}
          initial={false}
          animate={{
            width: thumbWidth,
            left: thumbLeft,
            transition: {
              width: disableInitialMotion ? { duration: 0 } : { duration: STRETCH_DURATION / 1000 },
              left: disableInitialMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 520, damping: 34, mass: 0.25 },
            },
          }}
          style={{
            height: THUMB_SIZE,
            minWidth: THUMB_SIZE,
            maxWidth: THUMB_STRETCH,
            left: thumbLeft,
          }}
        />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch }
