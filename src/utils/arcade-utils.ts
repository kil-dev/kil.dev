// Arcade-style utility functions

function generateArcadeSound(frequency: number, duration = 100) {
  // Simple beep sound generation for arcade feel
  if (globalThis.window === undefined) return

  const audioContext = new (globalThis.window.AudioContext ||
    (globalThis.window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
  oscillator.type = 'square'

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)

  let cleanedUp = false
  let fallbackTimeoutId: number | null = null

  const cleanup = () => {
    if (cleanedUp) return
    cleanedUp = true
    try {
      oscillator.removeEventListener('ended', cleanup)
      if (fallbackTimeoutId !== null) {
        clearTimeout(fallbackTimeoutId)
        fallbackTimeoutId = null
      }
      try {
        // Stop in case it hasn't already
        oscillator.stop()
      } catch {}
      try {
        oscillator.disconnect()
      } catch {}
      try {
        gainNode.disconnect()
      } catch {}
      void audioContext.close().catch(() => null)
    } catch {}
  }

  oscillator.addEventListener('ended', cleanup)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + duration / 1000)

  // Fallback in case onended doesn't fire (browser quirks)
  fallbackTimeoutId = globalThis.window.setTimeout(cleanup, Math.ceil(duration * 1.5))
}

export function playScoreSound(score: number) {
  // Different sounds for different score milestones
  if (score % 100 === 0) {
    generateArcadeSound(800, 200) // High score milestone
  } else if (score % 50 === 0) {
    generateArcadeSound(600, 150) // Medium milestone
  } else {
    generateArcadeSound(400, 100) // Regular score
  }
}

export function playGameOverSound() {
  // Descending tone for game over
  generateArcadeSound(300, 500)
  setTimeout(() => generateArcadeSound(200, 500), 100)
}
