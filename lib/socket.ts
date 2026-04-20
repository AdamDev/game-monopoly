import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/socket-events'

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let socket: GameSocket | null = null

export function getSocket(gameId: string, playerId: string): GameSocket {
  if (socket?.connected) return socket

  socket = io({
    query: { gameId, playerId },
    transports: ['websocket', 'polling'],
  }) as GameSocket

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
