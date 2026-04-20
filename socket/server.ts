import { Server as SocketIOServer, Socket } from 'socket.io'
import { connectToDatabase } from '../lib/mongodb'
import { Game } from '../models/Game'
import { handleGameActions } from './handlers/game-actions'
import type { ClientToServerEvents, ServerToClientEvents } from '../types/socket-events'

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>

export function setupSocketHandlers(io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>) {
  io.on('connection', async (socket: GameSocket) => {
    const { gameId, playerId } = socket.handshake.query as {
      gameId?: string
      playerId?: string
    }

    if (!gameId || !playerId) {
      socket.emit('error', { message: 'Missing gameId or playerId' })
      socket.disconnect()
      return
    }

    console.log(`Player ${playerId} connecting to game ${gameId}`)

    try {
      await connectToDatabase()
      const game = await Game.findById(gameId)

      if (!game) {
        socket.emit('error', { message: 'Game not found' })
        socket.disconnect()
        return
      }

      // Verify player is in the game
      const playerIdx = game.players.findIndex(
        (p: { playerId: string }) => p.playerId === playerId
      )
      if (playerIdx === -1) {
        socket.emit('error', { message: 'You are not in this game' })
        socket.disconnect()
        return
      }

      // Join the Socket.IO room for this game
      socket.join(gameId)

      // Mark player as connected
      game.players[playerIdx].connected = true
      await game.save()

      // Send full state to the connecting player
      socket.emit('game:state', game.toJSON())

      // Notify others
      socket.to(gameId).emit('player:connected', { playerId })
      broadcastLog(io, gameId, `${game.players[playerIdx].name} connected`)

      // Store context on socket for handlers
      socket.data = { gameId, playerId }

      // Register game action handlers
      handleGameActions(io, socket)

      // Handle disconnect
      socket.on('disconnect', async () => {
        console.log(`Player ${playerId} disconnected from game ${gameId}`)
        try {
          await connectToDatabase()
          const g = await Game.findById(gameId)
          if (g) {
            const pIdx = g.players.findIndex(
              (p: { playerId: string }) => p.playerId === playerId
            )
            if (pIdx !== -1) {
              g.players[pIdx].connected = false
              await g.save()
              io.to(gameId).emit('player:disconnected', { playerId })
              broadcastLog(io, gameId, `${g.players[pIdx].name} disconnected`)
            }
          }
        } catch (err) {
          console.error('Disconnect handler error:', err)
        }
      })
    } catch (err) {
      console.error('Socket connection error:', err)
      socket.emit('error', { message: 'Server error' })
      socket.disconnect()
    }
  })
}

export function broadcastLog(
  io: SocketIOServer,
  gameId: string,
  message: string
) {
  io.to(gameId).emit('log:entry', { message, timestamp: Date.now() })
}
