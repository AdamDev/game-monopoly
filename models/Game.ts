import { Schema, model, models } from 'mongoose'

const gamePlayerSchema = new Schema({
  playerId: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, required: true },
  position: { type: Number, default: 0 },
  money: { type: Number, default: 1500 },
  isInJail: { type: Boolean, default: false },
  jailTurns: { type: Number, default: 0 },
  getOutOfJailCards: { type: Number, default: 0 },
  isBankrupt: { type: Boolean, default: false },
  connected: { type: Boolean, default: true },
}, { _id: false })

const gamePropertySchema = new Schema({
  boardPosition: { type: Number, required: true },
  ownerPlayerId: { type: String, default: null },
  houses: { type: Number, default: 0 },
  isMortgaged: { type: Boolean, default: false },
}, { _id: false })

const gameSchema = new Schema({
  code: { type: String, required: true, unique: true, index: true },
  hostPlayerId: { type: String, required: true },
  status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
  maxPlayers: { type: Number, default: 6, min: 2, max: 6 },
  currentPlayerIndex: { type: Number, default: 0 },
  turnPhase: { type: String, enum: ['roll', 'action', 'end-turn'], default: 'roll' },
  doublesCount: { type: Number, default: 0 },
  players: [gamePlayerSchema],
  properties: [gamePropertySchema],
  chanceDrawPile: [Number],
  communityDrawPile: [Number],
  freeParkingPot: { type: Number, default: 0 },
  winner: { type: String, default: null },
}, { timestamps: true })

export const Game = models.Game || model('Game', gameSchema)
