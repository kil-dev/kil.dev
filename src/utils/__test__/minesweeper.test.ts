import { describe, expect, it } from 'vitest'
import { chord, createBoard, flagMines, reveal, toggleFlag } from '../minesweeper'

// random() === 0 lays the mines on the first free cells in board order, which makes boards predictable
const first = () => 0

describe('minesweeper', () => {
  it('keeps the first cell opened, and every cell touching it, free of mines', () => {
    const board = reveal(createBoard(5, 5), 12, 10, first)

    expect(board.status).toBe('playing')
    for (const index of [6, 7, 8, 11, 12, 13, 16, 17, 18]) expect(board.cells[index]?.mine).toBe(false)
    expect(board.cells.filter(cell => cell.mine)).toHaveLength(10)
  })

  it('opens the whole empty region when a cell with no mines around it is opened', () => {
    // 4x4, one mine at index 0: opening the far corner clears everything but the mine
    const board = reveal(createBoard(4, 4), 15, 1, first)

    expect(board.cells[0]?.mine).toBe(true)
    expect(board.cells.filter(cell => cell.revealed)).toHaveLength(15)
    expect(board.cells[1]?.adjacent).toBe(1)
    expect(board.status).toBe('won')
  })

  it('loses, and shows every mine, when a mine is opened', () => {
    // Mines on cells 0-8; opening the far corner leaves cell 9 still closed
    const playing = reveal(createBoard(5, 5), 24, 9, first)
    expect(playing.status).toBe('playing')
    const lost = reveal(playing, 0, 9, first)

    expect(lost.status).toBe('lost')
    expect(lost.cells.filter(cell => cell.mine).every(cell => cell.revealed)).toBe(true)
    // A finished board ignores further clicks
    expect(reveal(lost, 9, 9, first)).toBe(lost)
  })

  it('does not open a flagged cell until the flag is removed', () => {
    const playing = reveal(createBoard(5, 5), 24, 9, first)
    const flagged = toggleFlag(playing, 0)

    expect(reveal(flagged, 0, 9, first)).toBe(flagged)
    expect(reveal(toggleFlag(flagged, 0), 0, 9, first).status).toBe('lost')
  })

  it('opens the unflagged neighbours of a number once that many flags touch it', () => {
    // Mines on cells 0-8. Cell 14 shows 1 (it touches the mine on cell 8) and cell 9 is still closed.
    const playing = reveal(createBoard(5, 5), 24, 9, first)
    expect(playing.cells[14]?.adjacent).toBe(1)

    // No flag yet: the number does nothing
    expect(chord(playing, 14, 9, first)).toBe(playing)

    const cleared = chord(toggleFlag(playing, 8), 14, 9, first)
    expect(cleared.cells[9]?.revealed).toBe(true)
    expect(cleared.status).toBe('won')
  })

  it('loses when a number is chorded with the flag on the wrong cell', () => {
    const playing = reveal(createBoard(5, 5), 24, 9, first)

    // Cell 9 is safe; flagging it instead of the mine on cell 8 opens the mine
    expect(chord(toggleFlag(playing, 9), 14, 9, first).status).toBe('lost')
  })

  it('flags every hidden mine in help mode, leaving only safe cells to open', () => {
    const helped = flagMines(reveal(createBoard(5, 5), 24, 9, first))

    expect(helped.cells.filter(cell => cell.flagged).map(cell => cell.mine)).toEqual(
      Array.from({ length: 9 }, () => true),
    )
    expect(reveal(helped, 9, 9, first).status).toBe('won')
  })

  it('handles boards that are wider than they are tall', () => {
    // 4 wide, 2 tall, one mine on cell 0: the far corner is cell 7, and row 1 starts at cell 4
    const board = reveal(createBoard(4, 2), 7, 1, first)

    expect(board.cells).toHaveLength(8)
    // Cell 3 ends row 0 and cell 4 starts row 1: they are not neighbours, though their numbers are
    expect(board.cells[3]?.adjacent).toBe(0)
    expect(board.cells[4]?.adjacent).toBe(1)
    expect(board.cells[4]?.revealed).toBe(false)
    expect(reveal(board, 4, 1, first).status).toBe('won')
  })
})
