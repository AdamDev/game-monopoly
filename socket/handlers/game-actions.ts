import { Server as SocketIOServer, Socket } from 'socket.io'
import { connectToDatabase } from '../../lib/mongodb'
import { Game } from '../../models/Game'
import { broadcastLog } from '../server'
import {
  startGame,
  rollDice,
  rollInJail,
  payJailFine,
  handleLanding,
  buyProperty,
  endTurn,
} from '../../lib/game-engine'
import { BOARD } from '../../lib/board-data'
import type { ClientToServerEvents, ServerToClientEvents } from '../../types/socket-events'

type IO = SocketIOServer<ClientToServerEvents, ServerToClientEvents>
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>

function getCtx(socket: GameSocket) {
  return socket.data as { gameId: string; playerId: string }
}

/** Verify it is this player's turn */
function isMyTurn(game: { players: Array<{ playerId: string }>; currentPlayerIndex: number }, playerId: string): boolean {
  return game.players[game.currentPlayerIndex]?.playerId === playerId
}

export function handleGameActions(io: IO, socket: GameSocket) {
  // --- START GAME ---
  socket.on('game:start', async () => {
    const { gameId, playerId } = getCtx(socket)
    try {
      await connectToDatabase()
      const game = await Game.findById(gameId)
      if (!game) return socket.emit('error', { message: 'Game not found' })
      if (game.hostPlayerId !== playerId) return socket.emit('error', { message: 'Only the host can start' })
      if (game.status !== 'waiting') return socket.emit('error', { message: 'Game already started' })
      if (game.players.length < 2) return socket.emit('error', { message: 'Need at least 2 players' })

      startGame(game)
      await game.save()

      io.to(gameId).emit('game:started', game.toJSON())
      broadcastLog(io, gameId, 'Game started!')
      broadcastLog(io, gameId, `${game.players[0].name}'s turn`)
    } catch (err) {
      console.error('game:start error:', err)
      socket.emit('error', { message: 'Failed to start game' })
    }
  })

  // --- ROLL DICE ---
  socket.on('game:roll-dice', async () => {
    const { gameId, playerId } = getCtx(socket)
    try {
      await connectToDatabase()
      const game = await Game.findById(gameId)
      if (!game || game.status !== 'playing') return
      if (!isMyTurn(game, playerId)) return socket.emit('error', { message: 'Not your turn' })
      if (game.turnPhase !== 'roll') return socket.emit('error', { message: 'Cannot roll now' })

      const player = game.players[game.currentPlayerIndex]

      // Handle jail
      if (player.isInJail) {
        const jailResult = rollInJail(game)
        await game.save()

        io.to(gameId).emit('game:dice-rolled', {
          playerId,
          dice: jailResult.dice,
          isDoubles: jailResult.freed,
          newPosition: player.position,
          passedGo: false,
        })

        if (jailResult.freed) {
          broadcastLog(io, gameId, `${player.name} rolled doubles and escaped jail!`)
          // Handle landing after leaving jail
          const landing = handleLanding(game)
          await game.save()
          emitLandingEvents(io, gameId, game, landing)
        } else if (player.jailTurns >= 3) {
          broadcastLog(io, gameId, `${player.name} paid $50 after 3 turns in jail`)
          io.to(gameId).emit('game:money-changed', {
            playerId,
            money: player.money,
            reason: 'Jail fine (3 failed attempts)',
          })
        } else {
          broadcastLog(io, gameId, `${player.name} failed to roll doubles in jail (attempt ${player.jailTurns}/3)`)
        }

        io.to(gameId).emit('game:state', game.toJSON())
        return
      }

      // Normal roll
      const result = rollDice(game)

      io.to(gameId).emit('game:dice-rolled', {
        playerId,
        dice: result.dice,
        isDoubles: result.isDoubles,
        newPosition: result.newPosition,
        passedGo: result.passedGo,
      })

      const diceTotal = result.dice[0] + result.dice[1]
      broadcastLog(io, gameId, `${player.name} rolled ${result.dice[0]} + ${result.dice[1]} = ${diceTotal}`)

      if (result.passedGo) {
        broadcastLog(io, gameId, `${player.name} passed GO and collected $200`)
        io.to(gameId).emit('game:money-changed', {
          playerId,
          money: player.money,
          reason: 'Passed GO',
        })
      }

      if (result.sentToJail) {
        broadcastLog(io, gameId, `${player.name} rolled doubles 3 times — Go to Jail!`)
        io.to(gameId).emit('game:go-to-jail', { playerId })
        await game.save()
        io.to(gameId).emit('game:state', game.toJSON())
        return
      }

      // Handle landing
      const landing = handleLanding(game)
      await game.save()
      emitLandingEvents(io, gameId, game, landing)

      // If no action needed, auto-advance to end-turn
      if (landing.type === 'nothing' || landing.type === 'pay-rent' || landing.type === 'tax' || landing.type === 'go-to-jail') {
        game.turnPhase = 'end-turn'
        await game.save()
      }

      io.to(gameId).emit('game:state', game.toJSON())
    } catch (err) {
      console.error('game:roll-dice error:', err)
      socket.emit('error', { message: 'Failed to roll dice' })
    }
  })

  // --- BUY PROPERTY ---
  socket.on('game:buy-property', async () => {
    const { gameId, playerId } = getCtx(socket)
    try {
      await connectToDatabase()
      const game = await Game.findById(gameId)
      if (!game || game.status !== 'playing') return
      if (!isMyTurn(game, playerId)) return socket.emit('error', { message: 'Not your turn' })
      if (game.turnPhase !== 'action') return socket.emit('error', { message: 'Cannot buy now' })

      const result = buyProperty(game)
      if (!result) return socket.emit('error', { message: 'Cannot buy this property' })

      game.turnPhase = 'end-turn'
      await game.save()

      const player = game.players[game.currentPlayerIndex]
      const space = BOARD[result.position]
      io.to(gameId).emit('game:property-bought', {
        playerId,
        position: result.position,
        price: result.price,
        playerMoney: player.money,
      })
      broadcastLog(io, gameId, `${player.name} bought ${space.name} for $${result.price}`)

      io.to(gameId).emit('game:state', game.toJSON())
    } catch (err) {
      console.error('game:buy-property error:', err)
      socket.emit('error', { message: 'Failed to buy property' })
    }
  })

  // --- DECLINE PROPERTY (skip buying) ---
  socket.on('game:decline-property', async () => {
    const { gameId, playerId } = getCtx(socket)
    try {
      await connectToDatabase()
      const game = await Game.findById(gameId)
      if (!game || game.status !== 'playing') return
      if (!isMyTurn(game, playerId)) return
      if (game.turnPhase !== 'action') return

      game.turnPhase = 'end-turn'
      await game.save()

      const player = game.players[game.currentPlayerIndex]
      broadcastLog(io, gameId, `${player.name} declined to buy ${BOARD[player.position].name}`)
      io.to(gameId).emit('game:state', game.toJSON())
    } catch (err) {
      console.error('game:decline-property error:', err)
    }
  })

  // --- END TURN ---
  socket.on('game:end-turn', async () => {
    const { gameId, playerId } = getCtx(socket)
    try {
      await connectToDatabase()
      const game = await Game.findById(gameId)
      if (!game || game.status !== 'playing') return
      if (!isMyTurn(game, playerId)) return socket.emit('error', { message: 'Not your turn' })
      if (game.turnPhase !== 'end-turn') return socket.emit('error', { message: 'Cannot end turn now' })

      const result = endTurn(game)
      await game.save()

      const nextPlayer = game.players[result.nextPlayerIndex]
      io.to(gameId).emit('game:turn-changed', {
        currentPlayerIndex: result.nextPlayerIndex,
        turnPhase: game.turnPhase,
      })
      broadcastLog(io, gameId, `${nextPlayer.name}'s turn`)

      io.to(gameId).emit('game:state', game.toJSON())
    } catch (err) {
      console.error('game:end-turn error:', err)
      socket.emit('error', { message: 'Failed to end turn' })
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function emitLandingEvents(io: IO, gameId: string, game: any, landing: any) {
  const player = game.players[game.currentPlayerIndex]

  switch (landing.type) {
    case 'pay-rent': {
      const owner = game.players.find(
        (p: { playerId: string }) => p.playerId === landing.ownerId
      )
      io.to(gameId).emit('game:rent-paid', {
        payerId: player.playerId,
        ownerId: landing.ownerId,
        amount: landing.rentAmount,
        payerMoney: player.money,
        ownerMoney: owner?.money || 0,
      })
      broadcastLog(io, gameId, `${player.name} paid $${landing.rentAmount} rent to ${owner?.name || 'unknown'} for ${landing.space.name}`)
      break
    }
    case 'tax':
      io.to(gameId).emit('game:tax-paid', {
        playerId: player.playerId,
        amount: landing.taxAmount,
        playerMoney: player.money,
      })
      broadcastLog(io, gameId, `${player.name} paid $${landing.taxAmount} ${landing.space.name}`)
      break
    case 'go-to-jail':
      io.to(gameId).emit('game:go-to-jail', { playerId: player.playerId })
      broadcastLog(io, gameId, `${player.name} went to Jail!`)
      break
    case 'unowned-property':
      broadcastLog(io, gameId, `${player.name} landed on ${landing.space.name} ($${landing.space.price})`)
      break
    default:
      broadcastLog(io, gameId, `${player.name} landed on ${landing.space.name}`)
  }
}
