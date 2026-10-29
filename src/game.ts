export const ROUND_DURATION_MS = 30_000
export const MOLE_VISIBLE_MS = 920
export const HOLE_COUNT = 9

export type GameStatus = 'ready' | 'playing' | 'over'

export interface GameState {
  status: GameStatus
  score: number
  timeLeftMs: number
  activeHole: number | null
  moleTimeLeftMs: number
  spawnInMs: number
}

export function newGame(status: GameStatus = 'ready'): GameState {
  return {
    status,
    score: 0,
    timeLeftMs: ROUND_DURATION_MS,
    activeHole: null,
    moleTimeLeftMs: 0,
    spawnInMs: status === 'playing' ? 250 : 0,
  }
}

export function hitHole(state: GameState, holeIndex: number): GameState {
  if (state.status !== 'playing' || state.activeHole !== holeIndex) return state

  return {
    ...state,
    score: state.score + 1,
    activeHole: null,
    moleTimeLeftMs: 0,
    spawnInMs: 180,
  }
}

export function tickGame(state: GameState, elapsedMs: number, random: () => number = Math.random): GameState {
  if (state.status !== 'playing' || elapsedMs <= 0) return state

  const timeLeftMs = Math.max(0, state.timeLeftMs - elapsedMs)
  if (timeLeftMs === 0) {
    return { ...state, status: 'over', timeLeftMs: 0, activeHole: null, moleTimeLeftMs: 0 }
  }

  if (state.activeHole !== null) {
    const moleTimeLeftMs = state.moleTimeLeftMs - elapsedMs
    if (moleTimeLeftMs > 0) return { ...state, timeLeftMs, moleTimeLeftMs }
    return { ...state, timeLeftMs, activeHole: null, moleTimeLeftMs: 0, spawnInMs: 200 }
  }

  const spawnInMs = state.spawnInMs - elapsedMs
  if (spawnInMs > 0) return { ...state, timeLeftMs, spawnInMs }

  const randomHole = Math.floor(Math.max(0, Math.min(0.999999, random())) * HOLE_COUNT)
  return { ...state, timeLeftMs, activeHole: randomHole, moleTimeLeftMs: MOLE_VISIBLE_MS, spawnInMs: 0 }
}
