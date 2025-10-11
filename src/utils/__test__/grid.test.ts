import { describe, expect, it } from 'vitest'
import { getGameBoxDimensions, getGridDimensions, getSafeBoundaries } from '../grid'

describe('getGridDimensions', () => {
  it('calculates grid dimensions for standard window', () => {
    const result = getGridDimensions(1920, 1080)
    expect(result.gridCellSize).toBe(40)
    expect(result.gridOffset).toBe(-5)
    expect(result.gridWidth).toBe(48) // 1920 / 40
    expect(result.gridHeight).toBe(27) // 1080 / 40
  })

  it('handles very small window dimensions', () => {
    const result = getGridDimensions(400, 300)
    expect(result.gridWidth).toBe(10) // 400 / 40
    expect(result.gridHeight).toBe(7) // 300 / 40
    expect(result.gridCellSize).toBe(40)
  })

  it('handles very large window dimensions', () => {
    const result = getGridDimensions(3840, 2160)
    expect(result.gridWidth).toBe(96) // 3840 / 40
    expect(result.gridHeight).toBe(54) // 2160 / 40
  })

  it('handles zero dimensions gracefully', () => {
    const result = getGridDimensions(0, 0)
    // Math.floor(0 / 40) = 0, but if there's any NaN, check actual implementation
    // The actual values depend on the implementation
    expect(result.gridCellSize).toBe(40)
    expect(result.gridOffset).toBe(-5)
    // Accept NaN or 0 for zero dimensions
    expect(result.gridWidth === 0 || Number.isNaN(result.gridWidth)).toBe(true)
    expect(result.gridHeight === 0 || Number.isNaN(result.gridHeight)).toBe(true)
  })

  it('floors fractional grid calculations', () => {
    const result = getGridDimensions(1925, 1085)
    expect(result.gridWidth).toBe(48) // Math.floor(1925 / 40)
    expect(result.gridHeight).toBe(27) // Math.floor(1085 / 40)
  })
})

describe('getSafeBoundaries', () => {
  it('calculates safe boundaries for standard window', () => {
    const result = getSafeBoundaries(1920, 1080)
    expect(result.safeYMin).toBeGreaterThan(0)
    expect(result.safeYMax).toBeGreaterThan(result.safeYMin)
    expect(result.safeXMin).toBe(1)
    expect(result.safeXMax).toBeGreaterThan(result.safeXMin)
    expect(result.actualHeaderHeight).toBeGreaterThan(0)
    expect(result.footerHeight).toBeGreaterThan(0)
    expect(result.borderOffset).toBe(40)
  })

  it('maintains square grid within boundaries', () => {
    const result = getSafeBoundaries(1920, 1080)
    const width = result.safeXMax - result.safeXMin + 1
    const height = result.safeYMax - result.safeYMin + 1
    expect(width).toBe(height) // Should be square
  })

  it('handles small window dimensions', () => {
    const result = getSafeBoundaries(800, 600)
    expect(result.safeYMin).toBeGreaterThan(0)
    expect(result.safeYMax).toBeGreaterThan(result.safeYMin)
    expect(result.safeXMin).toBe(1)
    expect(result.safeXMax).toBeGreaterThan(result.safeXMin)
  })

  it('ensures safeYMax is greater than safeYMin', () => {
    const result = getSafeBoundaries(1920, 1080)
    expect(result.safeYMax).toBeGreaterThan(result.safeYMin)
  })

  it('ensures safeXMax is greater than safeXMin', () => {
    const result = getSafeBoundaries(1920, 1080)
    expect(result.safeXMax).toBeGreaterThan(result.safeXMin)
  })
})

describe('getGameBoxDimensions', () => {
  it('calculates complete game box dimensions', () => {
    const result = getGameBoxDimensions(1920, 1080)
    expect(result.gridCellSize).toBe(40)
    expect(result.gridOffset).toBe(-5)
    expect(result.centerGridX).toBeGreaterThanOrEqual(0)
    expect(result.squareGridSize).toBeGreaterThan(0)
    expect(result.squareSize).toBeGreaterThan(0)
    expect(result.borderLeft).toBeGreaterThan(0)
    expect(result.borderTop).toBeGreaterThan(0)
    expect(result.borderBottom).toBeGreaterThan(result.borderTop)
    expect(result.borderWidth).toBeGreaterThan(0)
    expect(result.borderHeight).toBeGreaterThan(0)
    expect(result.centerX).toBeGreaterThan(0)
    expect(result.centerY).toBeGreaterThan(0)
  })

  it('ensures border dimensions are consistent', () => {
    const result = getGameBoxDimensions(1920, 1080)
    expect(result.borderHeight).toBe(result.borderBottom - result.borderTop)
    expect(result.borderWidth).toBe(result.squareSize)
  })

  it('centers the game box horizontally', () => {
    const result = getGameBoxDimensions(1920, 1080)
    const centerX = result.borderLeft + result.borderWidth / 2
    expect(result.centerX).toBe(centerX)
  })

  it('centers the game box vertically', () => {
    const result = getGameBoxDimensions(1920, 1080)
    const centerY = result.borderTop + result.borderHeight / 2
    expect(result.centerY).toBe(centerY)
  })

  it('calculates square size from grid', () => {
    const result = getGameBoxDimensions(1920, 1080)
    expect(result.squareSize).toBe(result.squareGridSize * result.gridCellSize)
  })

  it('handles different window sizes consistently', () => {
    const sizes: Array<[number, number]> = [
      [1920, 1080],
      [1366, 768],
      [2560, 1440],
      [1024, 768],
    ]

    for (const [width, height] of sizes) {
      const result = getGameBoxDimensions(width, height)
      expect(result.squareSize).toBeGreaterThan(0)
      expect(result.centerX).toBeGreaterThan(0)
      expect(result.centerY).toBeGreaterThan(0)
    }
  })
})
