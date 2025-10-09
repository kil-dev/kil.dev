'use client'

import {
  type SecretConsoleEnv,
  SECRET_CONSOLE_COMMANDS,
  resolveSecretConsoleCommand,
} from '@/lib/secret-console-commands'
import { SECRET_CONSOLE_VFS } from '@/lib/secret-console-files'
import { type VfsNode, normalizePath, vfsList, vfsRead, vfsResolve } from '@/utils/secret-console-vfs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Entry = { type: 'in' | 'out'; text: string }

export function SecretConsole({ onRequestClose }: { onRequestClose: () => void }) {
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

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        if (history.length === 0) return
        e.preventDefault()
        if (historyIndex === null) {
          setSavedDraft(input)
          const idx = history.length - 1
          setHistoryIndex(idx)
          setInput(history[idx] ?? '')
          return
        }
        if (historyIndex > 0) {
          const idx = historyIndex - 1
          setHistoryIndex(idx)
          setInput(history[idx] ?? '')
        } else {
          setHistoryIndex(0)
          setInput(history[0] ?? '')
        }
        return
      }
      if (e.key === 'ArrowDown') {
        if (historyIndex === null) return
        e.preventDefault()
        const last = history.length - 1
        if (historyIndex < last) {
          const idx = historyIndex + 1
          setHistoryIndex(idx)
          setInput(history[idx] ?? '')
        } else {
          setHistoryIndex(null)
          setInput(savedDraft ?? '')
          setSavedDraft('')
        }
      }
    },
    [history, historyIndex, input, savedDraft],
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
        command.execute(args, env)
      } else {
        appendOutput(`command not found: ${cmd}`)
      }

      setInput('')
    },
    [input, env, appendOutput],
  )

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Developer console"
      className="fixed inset-x-0 top-0 z-50"
      style={{ fontFamily: 'var(--font-vt323)' }}>
      <div
        onMouseDown={focusInput}
        onClick={focusInput}
        onTransitionEnd={e => {
          if (isClosing && e.target === e.currentTarget) onRequestClose()
        }}
        className={`${isClosing ? 'translate-y-[-100%]' : 'translate-y-0'} bg-black/80 text-green-400 border-x border-b border-green-500/30 backdrop-blur-sm shadow-sm h-[45vh] starting:translate-y-[-100%] transition-transform duration-300 ease-out rounded-b-xl overflow-hidden mx-2 sm:mx-4`}>
        <div ref={scrollRef} className="h-[calc(45vh-3rem)] overflow-y-auto no-scrollbar p-4 space-y-1">
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
    </div>
  )
}
