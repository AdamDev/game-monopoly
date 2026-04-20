import { BOARD, BUYABLE_POSITIONS, getColorGroup, RAILROAD_POSITIONS, UTILITY_POSITIONS } from './board-data'
import type { BoardSpace } from '@/types/game'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GameDoc = any

export interface DiceRollResult {
  dice: [number, number]
  isDoubles: boolean
  newPosition: number
  passedGo: boolean
  sentToJail: boolean
}

export interface LandingResult {
  type: 'unowned-property' | 'pay-rent' | 'tax' | 'go-to-jail' | 'chance' | 'community-chest' | 'nothing'
  rentAmount?: number
  taxAmount?: number
  ownerId?: string
  space: BoardSpace
}

/** Roll two dice and move the current player */
export function rollDice(game: GameDoc): DiceRollResult {
  const die1 = Math.floor(Math.random() * 6) + 1
  const die2 = Math.floor(Math.random() * 6) + 1
  const isDoubles = die1 === die2
  const total = die1 + die2

  const player = game.players[game.currentPlayerIndex]

  // Three doubles in a row = jail
  if (isDoubles) {
    game.doublesCount += 1
    if (game.doublesCount >= 3) {
      sendToJail(game, player)
      return {
        dice: [die1, die2],
        isDoubles: true,
        newPosition: 10,
        passedGo: false,
        sentToJail: true,
      }
    }
  } else {
    game.doublesCount = 0
  }

  // Move player
  const oldPosition = player.position
  const newPosition = (oldPosition + total) % 40
  const passedGo = newPosition < oldPosition

  player.position = newPosition
  if (passedGo) {
    player.money += 200
  }

  game.turnPhase = 'action'

  return {
    dice: [die1, die2],
    isDoubles,
    newPosition,
    passedGo,
    sentToJail: false,
  }
}

/** Determine what happens when a player lands on a space */
export function handleLanding(game: GameDoc): LandingResult {
  const player = game.players[game.currentPlayerIndex]
  const space = BOARD[player.position]

  switch (space.type) {
    case 'property':
    case 'railroad':
    case 'utility': {
      const prop = game.properties.find(
        (p: { boardPosition: number }) => p.boardPosition === player.position
      )
      if (!prop || !prop.ownerPlayerId) {
        return { type: 'unowned-property', space }
      }
      if (prop.ownerPlayerId === player.playerId || prop.isMortgaged) {
        return { type: 'nothing', space }
      }
      // Calculate and pay rent
      const rent = calculateRent(game, prop, space)
      payRent(game, player, prop.ownerPlayerId, rent)
      return { type: 'pay-rent', rentAmount: rent, ownerId: prop.ownerPlayerId, space }
    }

    case 'tax': {
      const amount = space.taxAmount || 0
      player.money -= amount
      game.freeParkingPot += amount
      return { type: 'tax', taxAmount: amount, space }
    }

    case 'go-to-jail': {
      sendToJail(game, player)
      return { type: 'go-to-jail', space }
    }

    case 'chance':
      return { type: 'chance', space }

    case 'community-chest':
      return { type: 'community-chest', space }

    default:
      return { type: 'nothing', space }
  }
}

/** Calculate rent for a property */
function calculateRent(
  game: GameDoc,
  prop: { boardPosition: number; ownerPlayerId: string; houses: number; isMortgaged: boolean },
  space: BoardSpace
): number {
  if (prop.isMortgaged) return 0

  if (space.type === 'railroad') {
    const ownedRailroads = RAILROAD_POSITIONS.filter(pos => {
      const rr = game.properties.find(
        (p: { boardPosition: number; ownerPlayerId: string }) =>
          p.boardPosition === pos && p.ownerPlayerId === prop.ownerPlayerId
      )
      return !!rr
    }).length
    return 25 * Math.pow(2, ownedRailroads - 1)
  }

  if (space.type === 'utility') {
    const ownedUtils = UTILITY_POSITIONS.filter(pos => {
      const u = game.properties.find(
        (p: { boardPosition: number; ownerPlayerId: string }) =>
          p.boardPosition === pos && p.ownerPlayerId === prop.ownerPlayerId
      )
      return !!u
    }).length
    // For simplicity, use a fixed dice total of 7 (average)
    // In a full implementation, we'd pass the actual dice total
    const multiplier = ownedUtils >= 2 ? 10 : 4
    return 7 * multiplier
  }

  // Regular property
  if (!space.rent) return 0

  if (prop.houses > 0) {
    return space.rent[prop.houses] || 0
  }

  // Check for color set bonus (double rent with no houses)
  const colorGroup = getColorGroup(space.color!)
  const ownsAll = colorGroup.every(pos => {
    const p = game.properties.find(
      (gp: { boardPosition: number; ownerPlayerId: string }) =>
        gp.boardPosition === pos && gp.ownerPlayerId === prop.ownerPlayerId
    )
    return !!p
  })

  return ownsAll ? space.rent[0] * 2 : space.rent[0]
}

/** Transfer rent from player to owner */
function payRent(game: GameDoc, payer: { playerId: string; money: number }, ownerId: string, amount: number) {
  payer.money -= amount
  const owner = game.players.find((p: { playerId: string }) => p.playerId === ownerId)
  if (owner) {
    owner.money += amount
  }
}

/** Buy the property the current player is standing on */
export function buyProperty(game: GameDoc): { position: number; price: number } | null {
  const player = game.players[game.currentPlayerIndex]
  const space = BOARD[player.position]

  if (!BUYABLE_POSITIONS.includes(player.position)) return null
  if (!space.price) return null

  const prop = game.properties.find(
    (p: { boardPosition: number; ownerPlayerId: string | null }) =>
      p.boardPosition === player.position
  )
  if (!prop || prop.ownerPlayerId) return null
  if (player.money < space.price) return null

  player.money -= space.price
  prop.ownerPlayerId = player.playerId

  return { position: player.position, price: space.price }
}

/** End the current player's turn */
export function endTurn(game: GameDoc): { nextPlayerIndex: number } {
  // If doubles were rolled, same player goes again
  if (game.doublesCount > 0 && game.turnPhase !== 'roll') {
    game.turnPhase = 'roll'
    return { nextPlayerIndex: game.currentPlayerIndex }
  }

  game.doublesCount = 0

  // Find next non-bankrupt player
  let next = (game.currentPlayerIndex + 1) % game.players.length
  let attempts = 0
  while (game.players[next].isBankrupt && attempts < game.players.length) {
    next = (next + 1) % game.players.length
    attempts++
  }

  game.currentPlayerIndex = next
  game.turnPhase = 'roll'

  return { nextPlayerIndex: next }
}

/** Start the game — shuffle player order, set status */
export function startGame(game: GameDoc): void {
  // Shuffle player order
  for (let i = game.players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [game.players[i], game.players[j]] = [game.players[j], game.players[i]]
  }
  game.status = 'playing'
  game.currentPlayerIndex = 0
  game.turnPhase = 'roll'
}

/** Send a player to jail */
function sendToJail(game: GameDoc, player: { position: number; isInJail: boolean; jailTurns: number }) {
  player.position = 10
  player.isInJail = true
  player.jailTurns = 0
  game.doublesCount = 0
  game.turnPhase = 'end-turn'
}

/** Handle jail turn — roll for doubles or pay to get out */
export function rollInJail(game: GameDoc): { freed: boolean; dice: [number, number] } {
  const player = game.players[game.currentPlayerIndex]
  const die1 = Math.floor(Math.random() * 6) + 1
  const die2 = Math.floor(Math.random() * 6) + 1

  if (die1 === die2) {
    player.isInJail = false
    player.jailTurns = 0
    const total = die1 + die2
    player.position = (10 + total) % 40
    game.turnPhase = 'action'
    return { freed: true, dice: [die1, die2] }
  }

  player.jailTurns += 1
  if (player.jailTurns >= 3) {
    // Must pay after 3 failed attempts
    player.money -= 50
    player.isInJail = false
    player.jailTurns = 0
    game.turnPhase = 'end-turn'
  } else {
    game.turnPhase = 'end-turn'
  }

  return { freed: false, dice: [die1, die2] }
}

/** Pay $50 to leave jail */
export function payJailFine(game: GameDoc): boolean {
  const player = game.players[game.currentPlayerIndex]
  if (!player.isInJail) return false
  if (player.money < 50) return false

  player.money -= 50
  player.isInJail = false
  player.jailTurns = 0
  game.turnPhase = 'roll'
  return true
}
