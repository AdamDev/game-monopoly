import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Game } from '@/models/Game'
import { PLAYER_COLORS } from '@/types/game'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { code, playerId, playerName } = await request.json()

    if (!code || !playerId || !playerName) {
      return Response.json({ error: 'code, playerId, and playerName are required' }, { status: 400 })
    }

    const game = await Game.findOne({ code: code.toUpperCase() })
    if (!game) {
      return Response.json({ error: 'Game not found' }, { status: 404 })
    }

    if (game.status !== 'waiting') {
      return Response.json({ error: 'Game has already started' }, { status: 400 })
    }

    // Check if player is already in the game
    const existing = game.players.find((p: { playerId: string }) => p.playerId === playerId)
    if (existing) {
      return Response.json(game)
    }

    if (game.players.length >= game.maxPlayers) {
      return Response.json({ error: 'Game is full' }, { status: 400 })
    }

    // Assign next available color
    const usedColors = new Set(game.players.map((p: { color: string }) => p.color))
    const color = PLAYER_COLORS.find(c => !usedColors.has(c)) || PLAYER_COLORS[0]

    game.players.push({
      playerId,
      name: playerName,
      color,
      position: 0,
      money: 1500,
      isInJail: false,
      jailTurns: 0,
      getOutOfJailCards: 0,
      isBankrupt: false,
      connected: true,
    })

    await game.save()
    return Response.json(game)
  } catch (err) {
    console.error('Join game error:', err)
    return Response.json({ error: 'Failed to join game' }, { status: 500 })
  }
}
