import { describe, expect, it } from 'vitest'
import { hitHole, newGame, tickGame } from './game'

describe('Hole Punch game logic', () => {
  it('scores a hit on the visible mole and hides it', () => {
    const state = { ...newGame('playing'), activeHole: 4, moleTimeLeftMs: 500 }

    const next = hitHole(state, 4)

    expect(next.score).toBe(1)
    expect(next.activeHole).toBeNull()
    expect(next.moleTimeLeftMs).toBe(0)
  })

  it('does not score when an empty hole is hit', () => {
    const state = { ...newGame('playing'), activeHole: 4, moleTimeLeftMs: 500 }

    expect(hitHole(state, 2)).toBe(state)
    expect(state.score).toBe(0)
    expect(state.activeHole).toBe(4)
  })

  it('ends the round when the timer reaches zero', () => {
    const state = { ...newGame('playing'), timeLeftMs: 100, activeHole: 4, moleTimeLeftMs: 500 }

    const next = tickGame(state, 100, () => 0.5)

    expect(next.status).toBe('over')
    expect(next.timeLeftMs).toBe(0)
    expect(next.activeHole).toBeNull()
  })

  it('spawns a mole in a valid hole after the brief delay', () => {
    const next = tickGame(newGame('playing'), 250, () => 0.5)

    expect(next.activeHole).toBe(4)
    expect(next.moleTimeLeftMs).toBeGreaterThan(0)
  })
})
