import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Game } from '@/models/Game'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params
    const game = await Game.findById(id)
    if (!game) {
      return Response.json({ error: 'Game not found' }, { status: 404 })
    }
    return Response.json(game)
  } catch (err) {
    console.error('Get game error:', err)
    return Response.json({ error: 'Failed to get game' }, { status: 500 })
  }
}
