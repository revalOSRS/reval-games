/**
 * Type definitions for Battleship Bingo system
 */

export type TileCategory = 
  | 'pvm'
  | 'skills'
  | 'quests'
  | 'minigames'
  | 'clues'
  | 'diaries'
  | 'pets'
  | 'collection'
  | 'slayer'
  | 'combat'
  | 'crafting'
  | 'agility'

export type TileDifficulty = 'easy' | 'medium' | 'hard' | 'extreme'

export type TileStatus = 'pending' | 'in-progress' | 'completed' | 'locked'

export type BuffDebuffType = 'buff' | 'debuff'

export interface BuffDebuff {
  id: string
  name: string
  description: string
  type: BuffDebuffType
  icon: string
  duration?: number // in hours, or null for permanent
}

export interface BonusTier {
  threshold: string // Description of the threshold (e.g., "Under 1:30", "500+ KC")
  points: number // Bonus points for achieving this tier
  requirementValue?: number // Numeric value for comparison if applicable
}

export interface BingoTile {
  id: string
  task: string
  category: TileCategory
  difficulty: TileDifficulty
  icon: string
  description?: string
  requirements?: string[]
  buffDebuffId?: string // optional link to a buff/debuff
  basePoints?: number // Base points for completing the task
  bonusTiers?: BonusTier[] // Optional tiered bonus system
}

export interface Team {
  id: string
  name: string
  color: string
  members: string[] // Discord IDs
  score?: number
}

export interface BoardTile {
  tileId: string
  assignedTo: string | null // team ID
  status: TileStatus
  completedBy?: string // Discord ID
  completedAt?: string // ISO timestamp
  proof?: string // URL to proof image/video
  notes?: string
}

export interface BoardGrid {
  columns: number
  rows: number
}

export interface BoardRules {
  pointsPerTile: number
  bonusForRow: number
  bonusForColumn: number
  timeLimit?: string
  allowDuplicates: boolean
  requireProof?: boolean
}

export interface BingoBoard {
  boardId: string
  name: string
  eventDate: string
  description: string
  teams: Team[]
  grid: BoardGrid
  tiles: Record<string, BoardTile> // key is like "A1", "B2", etc.
  rules: BoardRules
  startTime?: string
  endTime?: string
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
}

export interface TileCollection {
  tiles: BingoTile[]
}

/**
 * Helper to get coordinate from column and row
 */
export function getCoordinate(column: number, row: number): string {
  let colStr = ''
  let col = column
  
  while (col >= 0) {
    colStr = String.fromCharCode(65 + (col % 26)) + colStr
    col = Math.floor(col / 26) - 1
  }
  
  return `${colStr}${row + 1}`
}

/**
 * Helper to parse coordinate back to column and row
 */
export function parseCoordinate(coord: string): { column: number; row: number } | null {
  const match = coord.match(/^([A-Z]+)(\d+)$/)
  if (!match) return null
  
  const colStr = match[1]
  const row = parseInt(match[2]) - 1
  
  let column = 0
  for (let i = 0; i < colStr.length; i++) {
    column = column * 26 + (colStr.charCodeAt(i) - 64)
  }
  column -= 1
  
  return { column, row }
}

/**
 * Get all tiles in a row
 */
export function getTilesInRow(board: BingoBoard, row: number): BoardTile[] {
  const tiles: BoardTile[] = []
  
  for (let col = 0; col < board.grid.columns; col++) {
    const coord = getCoordinate(col, row)
    if (board.tiles[coord]) {
      tiles.push(board.tiles[coord])
    }
  }
  
  return tiles
}

/**
 * Get all tiles in a column
 */
export function getTilesInColumn(board: BingoBoard, column: number): BoardTile[] {
  const tiles: BoardTile[] = []
  
  for (let row = 0; row < board.grid.rows; row++) {
    const coord = getCoordinate(column, row)
    if (board.tiles[coord]) {
      tiles.push(board.tiles[coord])
    }
  }
  
  return tiles
}

/**
 * Calculate team score
 */
export function calculateTeamScore(board: BingoBoard, teamId: string): number {
  let score = 0
  
  // Count completed tiles
  const completedTiles = Object.values(board.tiles).filter(
    tile => tile.assignedTo === teamId && tile.status === 'completed'
  )
  score += completedTiles.length * board.rules.pointsPerTile
  
  // Check for completed rows
  for (let row = 0; row < board.grid.rows; row++) {
    const rowTiles = getTilesInRow(board, row)
    if (rowTiles.every(t => t.assignedTo === teamId && t.status === 'completed')) {
      score += board.rules.bonusForRow
    }
  }
  
  // Check for completed columns
  for (let col = 0; col < board.grid.columns; col++) {
    const colTiles = getTilesInColumn(board, col)
    if (colTiles.every(t => t.assignedTo === teamId && t.status === 'completed')) {
      score += board.rules.bonusForColumn
    }
  }
  
  return score
}

