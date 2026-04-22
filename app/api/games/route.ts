import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Game } from '@/models/Game'
import { BUYABLE_POSITIONS } from '@/lib/board-data'
import { PLAYER_COLORS } from '@/types/game'
import { getAvatarForName } from '@/lib/avatars'
import crypto from 'crypto'

function generateCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { playerId, playerName, maxPlayers = 6 } = await request.json()

    if (!playerId || !playerName) {
      return Response.json({ error: 'playerId and playerName are required' }, { status: 400 })
    }

    // Generate unique code (retry on collision)
    let code = generateCode()
    let attempts = 0
    while (await Game.findOne({ code }) && attempts < 10) {
      code = generateCode()
      attempts++
    }

    // Initialize properties for all buyable positions
    const properties = BUYABLE_POSITIONS.map(pos => ({
      boardPosition: pos,
      ownerPlayerId: null,
      houses: 0,
      isMortgaged: false,
    }))

    const game = await Game.create({
      code,
      hostPlayerId: playerId,
      maxPlayers: Math.min(Math.max(maxPlayers, 2), 6),
      players: [{
        playerId,
        name: playerName,
        color: PLAYER_COLORS[0],
        avatarUrl: getAvatarForName(playerName),
        position: 0,
        money: 1500,
        isInJail: false,
        jailTurns: 0,
        getOutOfJailCards: 0,
        isBankrupt: false,
        connected: true,
      }],
      properties,
      chanceDrawPile: shuffle([...Array(16).keys()]),
      communityDrawPile: shuffle([...Array(16).keys()]),
    })

    return Response.json(game, { status: 201 })
  } catch (err) {
    console.error('Create game error:', err)
    return Response.json({ error: 'Failed to create game' }, { status: 500 })
  }
}

function shuffle(arr: number[]): number[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
