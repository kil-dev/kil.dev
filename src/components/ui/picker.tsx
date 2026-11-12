'use client'

import { cn } from '@/utils/utils'
import { useEffect, useEffectEvent, useRef, useState } from 'react'

type PickerProps<T extends { id: string }> = {
  items: T[]
  /** Radio group name, e.g. "pet". */
  name: string
  /** What is being chosen, e.g. "Choose a pet". */
  legend: string
  label: (item: T) => string
  /** Fills the round 36px thumbnail beside the label. */
  avatar: (item: T) => React.ReactNode
  onSelect?: (item: T) => void
  /** Renders one item's detail. Called for every item; only the chosen one is shown. */
  children: (item: T) => React.ReactNode
}

/**
 * One item at a time: a list of choices on the left, the chosen one on the right. Keeps a
 * whole collection (pets, jobs, projects) on a single screen. The list is a radio group, so
 * arrow keys step through it and wrap round. On a phone or a short screen the list
 * turns into a row of thumbnails above the detail, and swiping the detail sideways steps through. Each row is a lumpy blob of slime:
 * faint and jiggling under the pointer, solid when chosen.
 */
export function Picker<T extends { id: string }>({
  items,
  name,
  legend,
  label,
  avatar,
  onSelect,
  children,
}: PickerProps<T>) {
  const [selectedId, setSelectedId] = useState(items[0]?.id)
  const rootRef = useRef<HTMLDivElement>(null)
  const [slide, setSlide] = useState<'left' | 'right' | null>(null)
  const index = Math.max(
    0,
    items.findIndex(item => item.id === selectedId),
  )
  // Swiping sideways anywhere on the page this picker sits in steps to the next or previous item,
  // so it works under an item with little text too. The direction is remembered so the new item
  // slides in from the side it was pulled from.
  const onSwipe = useEffectEvent((direction: 1 | -1) => {
    const next = items[(index + direction + items.length) % items.length]
    if (!next || next.id === selectedId) return
    setSlide(direction === 1 ? 'left' : 'right')
    setSelectedId(next.id)
    onSelect?.(next)
  })
  useEffect(() => {
    const page = rootRef.current?.closest<HTMLElement>('.snap-start') ?? rootRef.current
    if (!page) return
    let start: { x: number; y: number } | null = null
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      start = touch ? { x: touch.clientX, y: touch.clientY } : null
    }
    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0]
      if (!start || !touch) return
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      start = null
      // A deliberate sideways swipe, not a scroll or a tap
      if (Math.abs(dx) >= 48 && Math.abs(dx) >= Math.abs(dy) * 1.5) onSwipe(dx < 0 ? 1 : -1)
    }
    page.addEventListener('touchstart', onTouchStart, { passive: true })
    page.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      page.removeEventListener('touchstart', onTouchStart)
      page.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const selected = items[index]
  if (!selected) return null

  const select = (item: T) => {
    if (item.id === selected.id) return
    setSelectedId(item.id)
    onSelect?.(item)
  }

  return (
    <div
      ref={rootRef}
      className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 sm:gap-8 lg:gap-12 compact:grid-cols-1! compact:gap-3!">
      {/* On compact screens the list is a row of thumbnails above the detail. The thumbnails share
          the row's width and shrink to fit, so a long list never runs off the side. */}
      <fieldset className="flex flex-col gap-1 compact:grid! compact:auto-cols-[minmax(0,2.75rem)] compact:grid-flow-col compact:gap-1">
        <legend className="sr-only">{legend}</legend>
        {items.map(item => (
          <label
            key={item.id}
            className="group relative flex cursor-pointer items-center gap-3 rounded-full p-1 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary sm:pr-5 compact:block! compact:p-0.5!">
            {/* The row itself stays still, so the pointer never slips off it. The blob of slime
                behind it is what jiggles on hover and fills in when the row is chosen. */}
            <span aria-hidden className="slime-row-blob" />
            <input
              type="radio"
              name={name}
              aria-label={label(item)}
              className="sr-only"
              checked={item.id === selected.id}
              onChange={() => {
                setSlide(null)
                select(item)
              }}
            />
            <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary font-black compact:aspect-square compact:size-auto! compact:w-full!">
              {avatar(item)}
            </span>
            <span
              aria-hidden
              className="relative hidden max-w-44 text-base leading-tight display-text wrap-anywhere text-muted-foreground group-hover:text-foreground group-has-checked:text-primary-foreground sm:block lg:max-w-none lg:whitespace-nowrap compact:hidden!">
              {label(item)}
            </span>
          </label>
        ))}
      </fieldset>
      {/* Every item is laid out in the same cell and only the chosen one shows, so the picker is
          always as tall as its tallest item and the page does not move when the choice changes.
          The list and the chosen item are centred on each other, whichever is taller. */}
      <div className="grid">
        {items.map(item => {
          const chosen = item.id === selected.id
          return (
            <div
              key={item.id}
              inert={!chosen}
              // Compact screens scroll, so there the detail sits right under the thumbnails and only
              // the chosen item takes up room
              className={cn(
                'col-start-1 row-start-1 self-center compact:self-start!',
                chosen
                  ? slide === 'left'
                    ? 'animate-slide-from-right'
                    : slide === 'right'
                      ? 'animate-slide-from-left'
                      : 'animate-pop'
                  : 'invisible compact:hidden!',
              )}>
              {children(item)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
