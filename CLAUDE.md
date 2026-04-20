# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (custom server.ts with Socket.IO + Next.js)
npm run build    # Production build (type-checks)
npm run lint     # ESLint
PORT=3002 npm run dev  # Use alternate port if 3000 is taken
```

## Architecture

**Online multiplayer Monopoly game** — Next.js 16 (App Router) + Socket.IO for real-time gameplay.

**Custom server:** `server.ts` creates an HTTP server with both Next.js and Socket.IO attached. Dev runs via `tsx server.ts`. This is required because Next.js App Router doesn't natively support WebSockets.

**No auth:** Players get a random UUID in localStorage (`lib/player.ts`) and enter a display name. No registration/login.

**Game state:** Server-authoritative. All game logic lives in `lib/game-engine.ts` as pure functions. State persisted in MongoDB after every action. Socket.IO broadcasts updates to all players in the game room.

**Flow:** Landing page → Create/Join game (REST API) → Waiting room (Socket.IO) → Game board (Socket.IO events for all actions).

**Key paths:**
- `server.ts` — custom HTTP server entry point
- `socket/server.ts` — Socket.IO connection handling, room management
- `socket/handlers/game-actions.ts` — game event handlers (roll, buy, end turn)
- `lib/game-engine.ts` — pure game logic (rollDice, handleLanding, buyProperty, etc.)
- `lib/board-data.ts` — static Monopoly board definition (40 spaces)
- `models/Game.ts` — Mongoose schema for full game state
- `app/game/[id]/page.tsx` — main game page (board + Socket.IO client)

**REST API (lobby only):**
- `POST /api/games` — create game
- `POST /api/games/join` — join by 6-char code
- `GET /api/games/[id]` — get game state

**Socket.IO events (in-game):** `game:start`, `game:roll-dice`, `game:buy-property`, `game:decline-property`, `game:end-turn` (client→server). Server broadcasts full `game:state` after each action.
