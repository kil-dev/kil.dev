import { playGameOverSound, playScoreSound } from '@/utils/arcade-utils'
import { getGameBoxDimensions, getGridDimensions, getSafeBoundaries, type GameBoxDimensions } from '@/utils/grid'
import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
export type Position = { x: number; y: number }

const BASE_GAME_SPEED = 150
const MIN_GAME_SPEED = 80
const SPEED_REDUCTION_PER_SEGMENT = 2
const GOLDEN_APPLE_CHANCE = 0.02
const MAX_FOOD_GENERATION_ATTEMPTS = 100

type UseSnakeGameOptions = {
  isInputActive?: boolean
  onGameOver?: (score: number) => void
  onGameStart?: () => void | Promise<void>
  onMove?: (
    direction: Direction,
    gameState: { snake: Position[]; food: Position; isGoldenApple: boolean; score: number; direction: Direction },
  ) => void | Promise<void>
  onFoodEaten?: (position: Position, isGolden: boolean, newScore: number) => void | Promise<void>
}

export function useSnakeGame(options: UseSnakeGameOptions = {}) {
  const { isInputActive = false, onGameOver, onGameStart, onMove, onFoodEaten } = options

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [snake, setSnake] = useState<Position[]>([{ x: 5, y: 5 }])
  const [food, setFood] = useState<Position>({ x: 10, y: 10 })
  const [isGoldenApple, setIsGoldenApple] = useState(false)
  const [direction, setDirection] = useState<Direction>('RIGHT')
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const gameLoopRef = useRef<number | null>(null)
  const lastFoodEatenRef = useRef<Position | null>(null)

  // expose derived dimensions
  const getDimensions = useCallback((): GameBoxDimensions => {
    return getGameBoxDimensions(windowSize.width, windowSize.height)
  }, [windowSize])

  const getCurrentGameSpeed = useCallback((snakeLength: number) => {
    const speedReduction = (snakeLength - 1) * SPEED_REDUCTION_PER_SEGMENT
    const newSpeed = BASE_GAME_SPEED - speedReduction
    return Math.max(newSpeed, MIN_GAME_SPEED)
  }, [])

  // Track window size
  useEffect(() => {
    if (globalThis.window === undefined) return
    const updateWindowSize = () =>
      setWindowSize({ width: globalThis.window.innerWidth, height: globalThis.window.innerHeight })
    updateWindowSize()
    globalThis.window.addEventListener('resize', updateWindowSize)
    return () => globalThis.window.removeEventListener('resize', updateWindowSize)
  }, [])

  // Generate random food position within safe bounds without recursion
  const generateFood = useCallback(
    (currentSnake: Position[]): { position: Position; isGolden: boolean } => {
      const { gridWidth, gridHeight } = getGridDimensions(windowSize.width, windowSize.height)
      const { safeYMin, safeYMax, safeXMin, safeXMax } = getSafeBoundaries(windowSize.width, windowSize.height)

      const isGolden = Math.random() < GOLDEN_APPLE_CHANCE

      const isSafeAreaValid = !(safeYMin >= safeYMax || safeXMin >= safeXMax)

      const getRandomInSafeArea = (): Position => ({
        x: safeXMin + Math.floor(Math.random() * (safeXMax - safeXMin + 1)),
        y: safeYMin + Math.floor(Math.random() * (safeYMax - safeYMin + 1)),
      })

      const getRandomInGrid = (): Position => ({
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight),
      })

      // Bounded attempts to find a free cell
      for (let attempt = 0; attempt < MAX_FOOD_GENERATION_ATTEMPTS; attempt++) {
        const candidate = isSafeAreaValid ? getRandomInSafeArea() : getRandomInGrid()
        const isOnSnake = currentSnake.some(segment => segment.x === candidate.x && segment.y === candidate.y)
        if (!isOnSnake) {
          return { position: candidate, isGolden }
        }
      }

      // Exhausted attempts — compute list of free cells
      const freeCells: Position[] = []

      if (isSafeAreaValid) {
        for (let y = safeYMin; y <= safeYMax; y++) {
          for (let x = safeXMin; x <= safeXMax; x++) {
            const occupied = currentSnake.some(segment => segment.x === x && segment.y === y)
            if (!occupied) freeCells.push({ x, y })
          }
        }
      }

      // If no free cells in safe area (or safe area invalid), scan whole grid
      if (freeCells.length === 0) {
        for (let y = 0; y < gridHeight; y++) {
          for (let x = 0; x < gridWidth; x++) {
            const occupied = currentSnake.some(segment => segment.x === x && segment.y === y)
            if (!occupied) freeCells.push({ x, y })
          }
        }
      }

      if (freeCells.length > 0) {
        const index = Math.floor(Math.random() * freeCells.length)
        const chosen = freeCells[index]!
        return { position: chosen, isGolden }
      }

      // Deterministic fallback (should be unreachable unless grid is entirely filled)
      const fallback: Position = isSafeAreaValid ? { x: safeXMin, y: safeYMin } : { x: 0, y: 0 }
      return { position: fallback, isGolden }
    },
    [windowSize],
  )

  const initGame = useCallback(() => {
    const { safeYMin, safeYMax, safeXMin, safeXMax } = getSafeBoundaries(windowSize.width, windowSize.height)
    const startX = Math.max(safeXMin + 2, Math.min(5, safeXMax - 2))
    const startY = Math.max(safeYMin + 2, Math.min(5, safeYMax - 2))
    const startingSnake: Position[] = [{ x: startX, y: startY }]
    setSnake(startingSnake)

    const foodData = generateFood(startingSnake)
    setFood(foodData.position)
    setIsGoldenApple(foodData.isGolden)

    setDirection('RIGHT')
    setGameOver(false)
    setScore(0)
    setIsPlaying(true)
    if (onGameStart) {
      Promise.resolve(onGameStart()).catch(console.error)
    }
    lastFoodEatenRef.current = null
  }, [generateFood, windowSize, onGameStart])

  function getNextHeadPosition(currentDirection: Direction, currentHead: Position): Position {
    switch (currentDirection) {
      case 'UP':
        return { x: currentHead.x, y: currentHead.y - 1 }
      case 'DOWN':
        return { x: currentHead.x, y: currentHead.y + 1 }
      case 'LEFT':
        return { x: currentHead.x - 1, y: currentHead.y }
      case 'RIGHT':
        return { x: currentHead.x + 1, y: currentHead.y }
    }
  }

  function isOutOfBounds(
    pos: Position,
    bounds: { safeYMin: number; safeYMax: number; safeXMin: number; safeXMax: number },
  ): boolean {
    return pos.x < bounds.safeXMin || pos.x > bounds.safeXMax || pos.y < bounds.safeYMin || pos.y > bounds.safeYMax
  }

  function isSelfCollision(pos: Position, snakePositions: Position[]): boolean {
    return snakePositions.some(segment => segment.x === pos.x && segment.y === pos.y)
  }

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      if (!prevSnake[0]) return prevSnake

      const handleGameOver = (prev: Position[]): Position[] => {
        setGameOver(true)
        setIsPlaying(false)
        playGameOverSound()
        if (onGameOver) onGameOver(score)
        return prev
      }

      const currentHead: Position = { x: prevSnake[0].x, y: prevSnake[0].y }
      const nextHead = getNextHeadPosition(direction, currentHead)
      const bounds = getSafeBoundaries(windowSize.width, windowSize.height)

      if (isOutOfBounds(nextHead, bounds)) return handleGameOver(prevSnake)
      if (isSelfCollision(nextHead, prevSnake)) return handleGameOver(prevSnake)

      const newSnake = [nextHead, ...prevSnake]

      const isFoodCell = nextHead.x === food.x && nextHead.y === food.y
      if (isFoodCell) {
        const currentFood = { x: food.x, y: food.y }
        const alreadyCounted =
          lastFoodEatenRef.current &&
          lastFoodEatenRef.current.x === currentFood.x &&
          lastFoodEatenRef.current.y === currentFood.y
        if (alreadyCounted) return newSnake

        lastFoodEatenRef.current = currentFood
        const pointsToAdd = isGoldenApple ? 50 : 10
        const updatedScore = score + pointsToAdd
        playScoreSound(updatedScore)
        setScore(updatedScore)
        if (onFoodEaten) {
          Promise.resolve(onFoodEaten(currentFood, isGoldenApple, updatedScore)).catch(console.error)
        }

        const foodData = generateFood(newSnake)
        setFood(foodData.position)
        setIsGoldenApple(foodData.isGolden)
        return newSnake
      }

      lastFoodEatenRef.current = null
      newSnake.pop()

      if (onMove) {
        Promise.resolve(
          onMove(direction, {
            snake: newSnake,
            food,
            isGoldenApple,
            score,
            direction,
          }),
        ).catch(console.error)
      }
      return newSnake
    })
  }, [direction, windowSize, isGoldenApple, food, onGameOver, score, generateFood, onMove, onFoodEaten])

  // game loop
  useEffect(() => {
    if (globalThis.window === undefined) return
    if (!isPlaying || gameOver) return
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    const currentSpeed = getCurrentGameSpeed(snake.length)
    gameLoopRef.current = globalThis.window.setInterval(moveSnake, currentSpeed)
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [isPlaying, gameOver, snake.length, getCurrentGameSpeed, moveSnake])

  // movement keys
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (!isPlaying || isInputActive) return
    switch (e.key) {
      case 'ArrowUp':
        if (direction !== 'DOWN') setDirection('UP')
        break
      case 'ArrowDown':
        if (direction !== 'UP') setDirection('DOWN')
        break
      case 'ArrowLeft':
        if (direction !== 'RIGHT') setDirection('LEFT')
        break
      case 'ArrowRight':
        if (direction !== 'LEFT') setDirection('RIGHT')
        break
    }
  })
  useEffect(() => {
    if (globalThis.window === undefined) return
    globalThis.window.addEventListener('keydown', onKey)
    return () => globalThis.window.removeEventListener('keydown', onKey)
  }, [onKey])

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [])

  return {
    // state
    snake,
    food,
    isGoldenApple,
    direction,
    gameOver,
    score,
    isPlaying,
    // actions
    initGame,
    moveSnake,
    setIsPlaying,
    setGameOver,
    // derived
    windowSize,
    getDimensions,
  }
}
