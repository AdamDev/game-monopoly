import type { GameState, GamePlayer } from './game'

export interface DiceResult {
  dice: [number, number]
  isDoubles: boolean
}

export interface ClientToServerEvents {
  'game:start': () => void
  'game:roll-dice': () => void
  'game:buy-property': () => void
  'game:decline-property': () => void
  'game:end-turn': () => void
}

export interface ServerToClientEvents {
  'game:state': (state: GameState) => void
  'game:started': (state: GameState) => void
  'game:player-joined': (player: GamePlayer) => void
  'game:dice-rolled': (data: {
    playerId: string
    dice: [number, number]
    isDoubles: boolean
    newPosition: number
    passedGo: boolean
  }) => void
  'game:property-bought': (data: {
    playerId: string
    position: number
    price: number
    playerMoney: number
  }) => void
  'game:rent-paid': (data: {
    payerId: string
    ownerId: string
    amount: number
    payerMoney: number
    ownerMoney: number
  }) => void
  'game:money-changed': (data: {
    playerId: string
    money: number
    reason: string
  }) => void
  'game:turn-changed': (data: {
    currentPlayerIndex: number
    turnPhase: string
  }) => void
  'game:go-to-jail': (data: { playerId: string }) => void
  'game:tax-paid': (data: {
    playerId: string
    amount: number
    playerMoney: number
  }) => void
  'player:connected': (data: { playerId: string }) => void
  'player:disconnected': (data: { playerId: string }) => void
  'log:entry': (data: { message: string; timestamp: number }) => void
  'error': (data: { message: string }) => void
}
