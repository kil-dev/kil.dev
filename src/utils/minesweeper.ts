type MineCell = { mine: boolean; revealed: boolean; flagged: boolean; adjacent: number }
export type MineBoard = {
  width: number
  height: number
  cells: MineCell[]
  /** `ready` until the first reveal, which is when the mines are laid. */
  status: 'ready' | 'playing' | 'won' | 'lost'
}

export function createBoard(width: number, height: number): MineBoard {
  const cells = Array.from({ length: width * height }, () => ({
    mine: false,
    revealed: false,
    flagged: false,
    adjacent: 0,
  }))
  return { width, height, cells, status: 'ready' }
}

function neighbours({ width, height }: MineBoard, index: number): number[] {
  const row = Math.floor(index / width)
  const column = index % width
  const around: number[] = []
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      const y = row + dy
      const x = column + dx
      if ((dx !== 0 || dy !== 0) && y >= 0 && y < height && x >= 0 && x < width) around.push(y * width + x)
    }
  }
  return around
}

/** Lays the mines anywhere except the first cell opened and the cells touching it, so the first click is always safe. */
function layMines(board: MineBoard, firstIndex: number, mines: number, random: () => number): MineCell[] {
  const safe = new Set([firstIndex, ...neighbours(board, firstIndex)])
  const free = board.cells.map((_, index) => index).filter(index => !safe.has(index))
  const cells = board.cells.map(cell => ({ ...cell }))
  for (let laid = 0; laid < mines && free.length > 0; laid += 1) {
    const [index] = free.splice(Math.floor(random() * free.length), 1)
    cells[index!]!.mine = true
  }
  for (const [index, cell] of cells.entries()) {
    cell.adjacent = neighbours(board, index).filter(near => cells[near]!.mine).length
  }
  return cells
}

/** Opens a cell. Opening a cell with no mines around it opens its neighbours too. */
export function reveal(board: MineBoard, index: number, mines: number, random: () => number = Math.random): MineBoard {
  const target = board.cells[index]
  if (!target || target.revealed || target.flagged || board.status === 'won' || board.status === 'lost') return board

  const cells =
    board.status === 'ready' ? layMines(board, index, mines, random) : board.cells.map(cell => ({ ...cell }))

  if (cells[index]!.mine) {
    for (const cell of cells) if (cell.mine) cell.revealed = true
    return { ...board, cells, status: 'lost' }
  }

  const queue = [index]
  while (queue.length > 0) {
    const current = queue.pop()!
    const cell = cells[current]!
    if (cell.revealed || cell.flagged) continue
    cell.revealed = true
    if (cell.adjacent === 0) queue.push(...neighbours(board, current))
  }

  const won = cells.every(cell => cell.mine || cell.revealed)
  return { ...board, cells, status: won ? 'won' : 'playing' }
}

export function toggleFlag(board: MineBoard, index: number): MineBoard {
  const target = board.cells[index]
  if (!target || target.revealed || board.status === 'won' || board.status === 'lost') return board
  const cells = board.cells.map((cell, i) => (i === index ? { ...cell, flagged: !cell.flagged } : cell))
  return { ...board, cells }
}

/**
 * Clicking an open number whose neighbours carry exactly that many flags opens its other
 * neighbours in one go. A wrong flag means one of them is a mine, and the game is lost.
 */
export function chord(board: MineBoard, index: number, mines: number, random: () => number = Math.random): MineBoard {
  const target = board.cells[index]
  if (!target?.revealed || target.mine || target.adjacent === 0 || board.status !== 'playing') return board
  const around = neighbours(board, index)
  if (around.filter(near => board.cells[near]!.flagged).length !== target.adjacent) return board
  let next = board
  for (const near of around) next = reveal(next, near, mines, random)
  return next
}

/** Plants a flag on every mine still hidden: the help mode for people who keep losing. */
export function flagMines(board: MineBoard): MineBoard {
  const cells = board.cells.map(cell => (cell.mine && !cell.revealed ? { ...cell, flagged: true } : cell))
  return { ...board, cells }
}
