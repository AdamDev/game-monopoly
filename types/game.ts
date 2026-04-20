export type BoardSpaceType =
  | 'property'
  | 'railroad'
  | 'utility'
  | 'chance'
  | 'community-chest'
  | 'tax'
  | 'go'
  | 'jail'
  | 'free-parking'
  | 'go-to-jail'

export type PropertyColor =
  | 'brown'
  | 'light-blue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'dark-blue'

export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange'

export const PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']

export interface BoardSpace {
  index: number
  name: string
  type: BoardSpaceType
  color?: PropertyColor
  price?: number
  rent?: number[]       // [base, 1house, 2house, 3house, 4house, hotel]
  houseCost?: number
  mortgageValue?: number
  taxAmount?: number
}

export type GameStatus = 'waiting' | 'playing' | 'finished'
export type TurnPhase = 'roll' | 'action' | 'end-turn'

export interface GamePlayer {
  playerId: string
  name: string
  color: PlayerColor
  position: number
  money: number
  isInJail: boolean
  jailTurns: number
  getOutOfJailCards: number
  isBankrupt: boolean
  connected: boolean
}

export interface GameProperty {
  boardPosition: number
  ownerPlayerId?: string
  houses: number        // 0-4 houses, 5 = hotel
  isMortgaged: boolean
}

export interface GameState {
  _id: string
  code: string
  hostPlayerId: string
  status: GameStatus
  maxPlayers: number
  currentPlayerIndex: number
  turnPhase: TurnPhase
  doublesCount: number
  players: GamePlayer[]
  properties: GameProperty[]
  chanceDrawPile: number[]
  communityDrawPile: number[]
  freeParkingPot: number
  winner?: string
  createdAt: string
  updatedAt: string
}
