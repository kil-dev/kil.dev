'use client'

import { SECRET_CONSOLE_COMMANDS, resolveSecretConsoleCommand } from '@/lib/secret-console-commands'
import { SECRET_CONSOLE_VFS } from '@/lib/secret-console-files'
import type { SecretConsoleEnv, VfsNode } from '@/types/secret-console'
import { computeTabCompletion } from '@/utils/console/completion'
import { normalizePath, vfsList, vfsRead, vfsResolve, vfsStat } from '@/utils/secret-console-vfs'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Entry = { type: 'in' | 'out'; text: string }

export function SecretConsole({ onRequestClose }: { onRequestClose: () => void }) {
  const router = useRouter()
  const [entries, setEntries] = useState<Entry[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [savedDraft, setSavedDraft] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
  }, [isClosing])

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    globalThis.addEventListener('keydown', onKeyDown)
    // Ensure view starts at bottom on open
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
    return () => globalThis.removeEventListener('keydown', onKeyDown)
  }, [handleClose])

  // Auto-scroll to bottom when entries update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries])

  // Listen for navigation events from the nav command
  useEffect(() => {
    function handleConsoleNavigate(event: Event) {
      const customEvent = event as CustomEvent<{ route: Route }>
      const { route } = customEvent.detail
      router.push(route)
    }

    globalThis.addEventListener('kd:console-navigate', handleConsoleNavigate)
    return () => globalThis.removeEventListener('kd:console-navigate', handleConsoleNavigate)
  }, [router])

  const rootVfs = useMemo<VfsNode>(() => SECRET_CONSOLE_VFS, [])
  const [cwd, setCwd] = useState<string>('/home')

  const appendOutput = useCallback((text: string) => {
    setEntries(prev => [...prev, { type: 'out', text }])
  }, [])
  const env = useMemo<SecretConsoleEnv>(
    () => ({
      appendOutput,
      pwd: () => cwd,
      list: (path: string) => vfsList(rootVfs, normalizePath(path.startsWith('/') ? path : `${cwd}/${path}`)),
      read: (path: string) => vfsRead(rootVfs, normalizePath(path.startsWith('/') ? path : `${cwd}/${path}`)),
      stat: (path: string) => vfsStat(rootVfs, normalizePath(path.startsWith('/') ? path : `${cwd}/${path}`)),
      chdir: (path: string) => {
        const abs = normalizePath(path.startsWith('/') ? path : `${cwd}/${path}`)
        const node = vfsResolve(rootVfs, abs)
        if (!node) return { ok: false as const, reason: 'not_found' as const }
        if (node.type !== 'dir') return { ok: false as const, reason: 'not_dir' as const }
        setCwd(abs)
        return { ok: true as const }
      },
      requestClose: handleClose,
    }),
    [appendOutput, cwd, rootVfs, handleClose],
  )

  const handleTabKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const el = inputRef.current
      if (!el) return

      const res = computeTabCompletion(input, el.selectionStart ?? input.length, {
        commands: SECRET_CONSOLE_COMMANDS,
        resolveCommand: resolveSecretConsoleCommand,
        cwd,
        list: (path: string) => vfsList(rootVfs, path),
        normalizePath,
      })

      if (res.suggestions && res.suggestions.length > 0) {
        appendOutput(res.suggestions.join('  '))
        return
      }

      if (res.value !== input) {
        setInput(res.value)
        requestAnimationFrame(() => {
          inputRef.current?.setSelectionRange(res.caret, res.caret)
        })
      }
    },
    [appendOutput, cwd, input, rootVfs],
  )

  const handleArrowUpKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (history.length === 0) return
      e.preventDefault()

      if (historyIndex === null) {
        setSavedDraft(input)
        const idx = history.length - 1
        setHistoryIndex(idx)
        setInput(history[idx] ?? '')
        return
      }

      const idx = Math.max(0, historyIndex - 1)
      setHistoryIndex(idx)
      setInput(history[idx] ?? '')
    },
    [history, historyIndex, input],
  )

  const handleArrowDownKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (historyIndex === null) return
      e.preventDefault()

      const last = history.length - 1
      if (historyIndex < last) {
        const idx = historyIndex + 1
        setHistoryIndex(idx)
        setInput(history[idx] ?? '')
        return
      }

      setHistoryIndex(null)
      setInput(savedDraft ?? '')
      setSavedDraft('')
    },
    [history, historyIndex, savedDraft],
  )

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'Tab':
          handleTabKey(e)
          break
        case 'ArrowUp':
          handleArrowUpKey(e)
          break
        case 'ArrowDown':
          handleArrowDownKey(e)
          break
      }
    },
    [handleTabKey, handleArrowUpKey, handleArrowDownKey],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = input.trim()
      if (!trimmed) return
      setEntries(prev => [...prev, { type: 'in', text: trimmed }])

      const tokens = trimmed.split(/\s+/)
      const cmd = tokens[0] ?? ''
      const args = tokens.slice(1)
      const resolved = resolveSecretConsoleCommand(cmd)
      if (resolved) {
        const command = SECRET_CONSOLE_COMMANDS[resolved]
        command?.execute(args, env)
      } else {
        appendOutput(`command not found: ${cmd}`)
      }

      setInput('')
      setHistory(prev => {
        const next = [...prev, trimmed]
        return next.length > 50 ? next.slice(-50) : next
      })
      setHistoryIndex(null)
      setSavedDraft('')
    },
    [input, env, appendOutput],
  )

  return (
    <dialog
      open
      aria-label="Developer console"
      className="fixed left-0 right-0 top-0 z-50 bg-transparent border-0 p-0 m-0 outline-hidden w-full max-w-none"
      style={{ fontFamily: 'var(--font-vt323)' }}>
      <div
        onMouseDown={focusInput}
        onClick={focusInput}
        onTransitionEnd={e => {
          if (isClosing && e.target === e.currentTarget) onRequestClose()
        }}
        className={`${isClosing ? 'translate-y-[-100%]' : 'translate-y-0'} bg-black/80 text-green-400 border-x border-b border-green-500/30 backdrop-blur-sm shadow-sm h-[45vh] starting:translate-y-[-100%] transition-transform duration-300 ease-out rounded-b-xl overflow-hidden mx-2 sm:mx-4`}>
        <div
          ref={scrollRef}
          className="h-[calc(45vh-3rem)] overflow-y-auto no-scrollbar p-4 flex flex-col justify-end gap-1">
          {entries.map((e, i) => (
            <div key={i} className={e.type === 'in' ? 'text-green-300' : 'text-green-400 whitespace-pre-wrap'}>
              {e.type === 'in' ? `$ ${e.text}` : e.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="h-12 border-t border-green-500/20 flex items-center gap-2 px-4">
          <span aria-hidden className="text-green-300">
            $
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="bg-transparent text-green-400 outline-hidden flex-1 placeholder:text-green-700"
            aria-label="Console input"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </form>
      </div>
    </dialog>
  )
}
