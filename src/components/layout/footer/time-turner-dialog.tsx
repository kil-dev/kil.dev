'use client'

import { CritterBody } from '@/components/layout/background/slime-critters'
import { useTheme } from '@/components/providers/theme-provider'
import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'
import { recordBubblePop } from '@/utils/bubble-pops'
import { startDotcomTransition } from '@/utils/dotcom-transition'
import { chord, createBoard, flagMines, reveal, toggleFlag, type MineBoard } from '@/utils/minesweeper'
import { cn } from '@/utils/utils'
import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useRef, useState } from 'react'

const TARGET_YEAR = 1999
/** The three Windows 98 board sizes. */
const LEVELS = [
  { name: 'Beginner', columns: 8, rows: 8, mines: 10 },
  { name: 'Intermediate', columns: 16, rows: 16, mines: 40 },
  { name: 'Expert', columns: 30, rows: 16, mines: 99 },
] as const

/** The first board ever cleared is the time machine. After that, it is just Minesweeper. */
function hasTravelledBefore() {
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.DOTCOM_THEME_UNLOCKED) === '1'
  } catch {
    return false
  }
}
type Level = (typeof LEVELS)[number]
const LONG_PRESS_MS = 450
/** Games lost before a critter turns up to help, very slowly and very clearly. */
const LOSSES_BEFORE_HELP = 3

const FACE: Record<MineBoard['status'], string> = { ready: '🙂', playing: '🙂', won: '😎', lost: '😵' }

/**
 * What the helper critter says. It turns up on the lost board of the third game, introduces
 * itself, and from the next game on flags every mine, because it thinks you need that.
 */
function helpLine(status: MineBoard['status'], flaggedForYou: boolean) {
  if (status === 'won') return 'You did it! And by you, I mean me. Off you go.'
  if (status === 'playing') {
    return 'See the little flags? Those are the mines. I found them all for you. Click the squares that are NOT flags.'
  }
  if (status === 'ready') return 'Good. Now click a square. Any square. I will do the hard part.'
  return flaggedForYou
    ? 'I put a flag on it. You took the flag off. Then you clicked it. Press the smiley. Slower this time.'
    : 'Oh. Hello. I live in the slime. That is three games you have lost, so I am going to help. Press the smiley.'
}

/**
 * Time travel is a game of Minesweeper in a Windows 98 window, a taste of where you are headed.
 * The first board you clear, of any size, takes the site back to 1999; after that it is just a
 * game. Hit a mine and the smiley starts a new one.
 * Left click opens a cell (an empty one opens everything empty around it), right click or a
 * long press plants a flag, and clicking a number with all its flags placed opens the rest
 * around it. Lose three times and a critter turns up to help; pop it and it leaves until the
 * next lost game. Bigger boards can be picked to play for their own sake.
 */
export function TimeTurnerDialog({ year }: Readonly<{ year: number }>) {
  const { setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [level, setLevel] = useState<Level>(LEVELS[0])
  const MINES = level.mines
  const [board, setBoard] = useState(() => createBoard(LEVELS[0].columns, LEVELS[0].rows))
  const COLUMNS = board.width
  const [focused, setFocused] = useState(0)
  const [losses, setLosses] = useState(0)
  // The helper can be popped to send it away; the next lost game brings it back
  const [helper, setHelper] = useState<'here' | 'popping' | 'gone'>('here')
  const helperTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const helperShown = losses >= LOSSES_BEFORE_HELP && helper !== 'gone'
  // It stops helping the moment it is popped, not when its splash has finished
  const helping = helperShown && helper === 'here'
  const popHelper = () => {
    if (helper !== 'here') return
    setHelper('popping')
    recordBubblePop()
    helperTimer.current = setTimeout(() => setHelper('gone'), 450)
  }
  const [flaggedForYou, setFlaggedForYou] = useState(false)
  const newGame = (next: Level = level) => {
    setLevel(next)
    // A board wider than it is tall (Expert) is turned on its side on a portrait screen, so it
    // fits the width and the window scrolls down instead of sideways
    const turned = next.columns > next.rows && globalThis.innerWidth < globalThis.innerHeight
    setBoard(turned ? createBoard(next.rows, next.columns) : createBoard(next.columns, next.rows))
    setFocused(0)
    setFlaggedForYou(false)
  }
  const grid = useRef<HTMLDivElement>(null)
  const longPress = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flaggedByPress = useRef(false)

  // A cleared board: the smiley puts on sunglasses, then the site goes back in time
  useEffect(() => {
    if (board.status !== 'won' || hasTravelledBefore()) return
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.DOTCOM_THEME_UNLOCKED, '1')
      } catch {}
      globalThis.dispatchEvent(new CustomEvent('kd:unlock-achievement', { detail: { achievementId: 'TIME_TURNER' } }))
      startDotcomTransition(() => {
        setTheme('dotcom')
      })
      setOpen(false)
    }, 900)
    return () => clearTimeout(timer)
  }, [board.status, setTheme])

  const flags = board.cells.filter(cell => cell.flagged).length

  /** Opens a closed cell, or chords an open number. In help mode every mine gets flagged first. */
  const openCell = (index: number) => {
    const wasOpen = board.cells[index]?.revealed
    let next = wasOpen ? chord(board, index, MINES) : reveal(board, index, MINES)
    if (helping && board.status === 'ready' && next.status === 'playing') {
      next = flagMines(next)
      setFlaggedForYou(true)
    }
    if (next.status === 'lost' && board.status !== 'lost') {
      setLosses(count => count + 1)
      // Losing while the helper is still mid-pop must not let that pop remove it afterwards
      clearTimeout(helperTimer.current ?? undefined)
      setHelper('here')
    }
    setBoard(next)
  }
  const moveFocus = (index: number) => {
    setFocused(index)
    grid.current?.querySelector<HTMLElement>(`[data-cell="${index}"]`)?.focus()
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={next => {
        setOpen(next)
        if (next) newGame(LEVELS[0])
      }}>
      <Dialog.Trigger asChild>
        <button aria-label="Turn back time" className="hover:opacity-80">
          {/* SSR-safe: render both and toggle with dotcom variant classes */}
          <span aria-hidden="true" className="hidden dotcom:inline">
            {TARGET_YEAR}
          </span>
          <span aria-hidden="true" className="inline dotcom:hidden">
            {year}
          </span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="win98-window fixed top-[50%] left-[50%] z-50 max-h-[calc(100dvh-1rem)] w-fit max-w-[calc(100%-1rem)] translate-x-[-50%] translate-y-[-50%] overflow-y-auto duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
          <div className="win98-titlebar">
            <Dialog.Title>Minesweeper</Dialog.Title>
            <Dialog.Close
              className="win98-raised grid size-5 place-items-center text-xs leading-none font-bold text-black"
              aria-label="Close">
              ✕
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Clear the board to travel back to {TARGET_YEAR}. Right click, or press F, to plant a flag.
          </Dialog.Description>

          {/* After three lost games a critter climbs onto the window to explain. Slowly. */}
          {helperShown && (
            <div className="absolute right-2 bottom-full flex items-end gap-3">
              <p
                key={`${board.status}-${flaggedForYou}`}
                role="status"
                className={cn(
                  helper === 'popping' && 'invisible',
                  'relative mb-6 w-60 animate-pop rounded-2xl bg-white px-3.5 py-2.5 text-sm leading-snug font-medium text-slate-900 shadow-lg after:absolute after:-right-1.5 after:bottom-4 after:size-3.5 after:rotate-45 after:bg-white',
                )}>
                {helpLine(board.status, flaggedForYou)}
              </p>
              <button
                type="button"
                aria-label="Pop the helper to send it away"
                className="relative w-20 shrink-0 cursor-pointer"
                onClick={popHelper}>
                {helper === 'popping' && <span className="slime-splash" />}
                <CritterBody blinkDelay="-2s" className={cn('block w-full', helper === 'popping' && 'invisible')} />
              </button>
            </div>
          )}

          {/* Board size */}
          <div role="radiogroup" aria-label="Board size" className="flex gap-1 px-1.5 pt-1.5 text-xs">
            {LEVELS.map(option => (
              <button
                key={option.name}
                type="button"
                role="radio"
                aria-checked={option === level}
                className={cn('win98-raised px-2 py-0.5', option === level && 'win98-pressed font-bold')}
                onClick={() => newGame(option)}>
                {option.name}
              </button>
            ))}
          </div>

          <div className="win98-raised m-1.5 flex flex-col gap-1.5 p-1.5">
            <div className="win98-sunken flex items-center justify-between p-1">
              <span className="win98-led" role="status" aria-label={`${Math.max(0, MINES - flags)} mines left to flag`}>
                {String(Math.max(0, MINES - flags)).padStart(3, '0')}
              </span>
              <button
                type="button"
                className="win98-raised grid size-8 place-items-center text-lg leading-none"
                aria-label={board.status === 'lost' ? 'You hit a mine. Start a new game' : 'Start a new game'}
                data-face={board.status}
                onClick={() => newGame()}>
                {FACE[board.status]}
              </button>
              <span className="win98-led" aria-hidden>
                {TARGET_YEAR}
              </span>
            </div>

            <div
              ref={grid}
              role="grid"
              aria-label="Minefield"
              className="win98-sunken grid w-fit max-w-[calc(100vw-2.5rem)] touch-manipulation overflow-x-auto select-none"
              style={
                {
                  gridTemplateColumns: `repeat(${COLUMNS}, var(--cell))`,
                  // Cells shrink so a big board fits the window, but never below a size you can hit;
                  // past that the board scrolls sideways
                  '--cell': `clamp(16px, min(calc((100vw - 3rem) / ${COLUMNS}), calc((100svh - 17rem) / ${board.height})), 30px)`,
                } as React.CSSProperties
              }
              onContextMenu={event => event.preventDefault()}
              onKeyDown={event => {
                const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -COLUMNS, ArrowDown: COLUMNS }[event.key]
                if (step === undefined) return
                event.preventDefault()
                const next = focused + step
                const sameRow = Math.floor(next / COLUMNS) === Math.floor(focused / COLUMNS)
                if (next >= 0 && next < board.cells.length && (Math.abs(step) === COLUMNS || sameRow)) moveFocus(next)
              }}>
              {board.cells.map((cell, index) => {
                const place = `Row ${Math.floor(index / COLUMNS) + 1}, column ${(index % COLUMNS) + 1}`
                const state = cell.revealed
                  ? cell.mine
                    ? 'mine'
                    : cell.adjacent === 0
                      ? 'empty'
                      : `${cell.adjacent} nearby`
                  : cell.flagged
                    ? 'flagged'
                    : 'closed'
                return (
                  <button
                    key={index}
                    type="button"
                    role="gridcell"
                    data-cell={index}
                    data-open={cell.revealed}
                    data-adjacent={cell.revealed && !cell.mine ? cell.adjacent : undefined}
                    tabIndex={index === focused ? 0 : -1}
                    aria-label={`${place}: ${state}`}
                    className={cn('mine-cell', cell.revealed && cell.mine && board.status === 'lost' && 'bg-red-600')}
                    onFocus={() => setFocused(index)}
                    onClick={() => {
                      // A long press has just flagged this cell: do not also open it
                      if (flaggedByPress.current) {
                        flaggedByPress.current = false
                        return
                      }
                      openCell(index)
                    }}
                    onContextMenu={() => setBoard(current => toggleFlag(current, index))}
                    onPointerDown={event => {
                      if (event.pointerType !== 'touch') return
                      longPress.current = setTimeout(() => {
                        flaggedByPress.current = true
                        setBoard(current => toggleFlag(current, index))
                      }, LONG_PRESS_MS)
                    }}
                    onPointerUp={() => clearTimeout(longPress.current ?? undefined)}
                    onPointerLeave={() => clearTimeout(longPress.current ?? undefined)}
                    onKeyDown={event => {
                      if (event.key.toLowerCase() === 'f') setBoard(current => toggleFlag(current, index))
                    }}>
                    {cell.revealed ? (cell.mine ? '💣' : cell.adjacent || '') : cell.flagged ? '🚩' : ''}
                  </button>
                )
              })}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
