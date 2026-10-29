<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { hitHole, newGame, tickGame, type GameState } from './game'

const BEST_SCORE_KEY = 'hole-punch-best-score'
const game = reactive<GameState>(newGame())
const bestScore = ref(0)
const lastHit = ref<number | null>(null)
const secondsLeft = computed(() => Math.ceil(game.timeLeftMs / 1000))
const timerPercent = computed(() => (game.timeLeftMs / 30_000) * 100)
const copy = computed(() => {
  if (game.status === 'ready') return { title: 'Ready when you are.', detail: 'Nine holes. One very quick mole.' }
  if (game.status === 'over') return { title: 'That’s a wrap.', detail: game.score > bestScore.value ? 'A new personal best. Beautifully done.' : 'Fancy another round?' }
  return { title: 'Eyes on the holes.', detail: 'They never stay for long.' }
})

function apply(next: GameState) {
  Object.assign(game, next)
}

function startRound() {
  lastHit.value = null
  apply(newGame('playing'))
}

function punch(index: number) {
  if (game.status !== 'playing') return
  const wasHit = game.activeHole === index
  apply(hitHole(game, index))
  if (wasHit) {
    lastHit.value = index
    window.setTimeout(() => {
      if (lastHit.value === index) lastHit.value = null
    }, 250)
    if (game.score > bestScore.value) {
      bestScore.value = game.score
      try {
        window.localStorage.setItem(BEST_SCORE_KEY, String(bestScore.value))
      } catch {
        // The round remains playable when browser storage is unavailable.
      }
    }
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  if (event.key.toLowerCase() === 'r') {
    event.preventDefault()
    startRound()
    return
  }
  if (/^[1-9]$/.test(event.key)) punch(Number(event.key) - 1)
}

let intervalId = 0
let lastTickAt = 0

onMounted(() => {
  try {
    const savedScore = Number(window.localStorage.getItem(BEST_SCORE_KEY))
    bestScore.value = Number.isFinite(savedScore) && savedScore > 0 ? savedScore : 0
  } catch {
    bestScore.value = 0
  }
  window.addEventListener('keydown', onKeydown)
  lastTickAt = Date.now()
  intervalId = window.setInterval(() => {
    const now = Date.now()
    apply(tickGame(game, now - lastTickAt))
    lastTickAt = now
  }, 80)
})

onUnmounted(() => {
  window.clearInterval(intervalId)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <main class="app-shell">
    <header class="topbar">
      <a class="brand" href="#top" aria-label="Hole Punch home">
        <span class="brand-mark" aria-hidden="true"><span></span></span>
        <span>hole<span class="brand-dash">/</span>punch</span>
      </a>
      <div class="topbar-note"><span class="status-dot"></span> A tiny test of reflexes</div>
      <a class="about-link" href="https://github.com/oscarmmi/whack-a-mole" target="_blank" rel="noreferrer">
        Made for the curious <span aria-hidden="true">↗</span>
      </a>
    </header>

    <section id="top" class="game-layout" aria-label="Hole Punch game">
      <div class="intro-row">
        <div class="intro-copy">
          <p class="eyebrow"><span>01</span> &nbsp;THE ARCADE, REIMAGINED</p>
          <h1>Hole <span>Punch.</span></h1>
          <p class="lede">A fast little game about being in exactly the right place at exactly the right time.</p>
        </div>
        <div class="best-card" aria-label="Personal best score">
          <span class="best-icon" aria-hidden="true">✳</span>
          <span class="best-label">YOUR BEST</span>
          <strong>{{ String(bestScore).padStart(2, '0') }}</strong>
        </div>
      </div>

      <div class="game-card">
        <div class="scorebar">
          <div class="stat-block">
            <span class="stat-label">SCORE</span>
            <strong class="score-value" aria-live="polite">{{ String(game.score).padStart(2, '0') }}</strong>
          </div>
          <div class="round-status" :class="{ 'is-live': game.status === 'playing' }">
            <span class="round-dot"></span>
            {{ game.status === 'playing' ? 'ROUND IN PROGRESS' : game.status === 'over' ? 'ROUND COMPLETE' : 'READY TO PLAY' }}
          </div>
          <div class="stat-block timer-block" :class="{ 'is-low': secondsLeft <= 5 && game.status === 'playing' }">
            <span class="stat-label">TIME</span>
            <strong class="timer-value" aria-live="off">{{ String(secondsLeft).padStart(2, '0') }}<small>s</small></strong>
          </div>
        </div>

        <div class="timer-track" aria-hidden="true"><span :style="{ width: `${timerPercent}%` }"></span></div>

        <div class="playfield" :class="{ 'game-active': game.status === 'playing' }">
          <div class="grid-heading"><span>FIELD A — 3 × 3</span><span>ROUND 30 SEC</span></div>
          <div class="hole-grid" role="group" aria-label="Nine mole holes">
            <button
              v-for="index in 9"
              :key="index"
              class="hole-button"
              :class="{ 'has-mole': game.activeHole === index - 1, 'just-hit': lastHit === index - 1 }"
              :style="{ '--mole-tone': ['#dfff73', '#b5a2ff', '#72ebd7', '#ffc480', '#f98ab8', '#a8d7ff', '#f0e77a', '#9ff0ad', '#ff9e80'][index - 1] }"
              :aria-label="`Hole ${index}${game.activeHole === index - 1 ? ', mole is up' : ''}`"
              :aria-pressed="game.activeHole === index - 1"
              :disabled="game.status !== 'playing'"
              @click="punch(index - 1)"
            >
              <span class="hole-glow"></span>
              <span class="hole-well">
                <span class="mole-art" aria-hidden="true">
                  <svg viewBox="0 0 100 100" role="presentation">
                    <ellipse class="mole-ear" cx="25" cy="29" rx="13" ry="16" />
                    <ellipse class="mole-ear-inner" cx="25" cy="31" rx="6" ry="8" />
                    <ellipse class="mole-ear" cx="75" cy="29" rx="13" ry="16" />
                    <ellipse class="mole-ear-inner" cx="75" cy="31" rx="6" ry="8" />
                    <path class="mole-head" d="M13 58c0-25 15-42 37-42s37 17 37 42v42H13V58Z" />
                    <ellipse class="mole-cheek" cx="28" cy="65" rx="8" ry="5" />
                    <ellipse class="mole-cheek" cx="72" cy="65" rx="8" ry="5" />
                    <ellipse class="mole-eye" cx="37" cy="49" rx="3.5" ry="5" />
                    <ellipse class="mole-eye" cx="63" cy="49" rx="3.5" ry="5" />
                    <ellipse class="mole-muzzle" cx="50" cy="62" rx="14" ry="10" />
                    <ellipse class="mole-nose" cx="50" cy="58" rx="4" ry="3" />
                    <path class="mole-smile" d="M46 66c2 3 6 3 8 0" />
                  </svg>
                </span>
                <span class="hole-rim"></span>
              </span>
              <span class="hole-number" aria-hidden="true">{{ String(index).padStart(2, '0') }}</span>
            </button>
          </div>
          <div v-if="game.status !== 'playing'" class="game-message" :class="{ 'message-over': game.status === 'over' }">
            <div class="message-spark" aria-hidden="true">{{ game.status === 'over' ? '✳' : '✦' }}</div>
            <h2>{{ copy.title }}</h2>
            <p>{{ copy.detail }}</p>
            <button class="start-button" @click="startRound">
              {{ game.status === 'over' ? 'Play again' : 'Start the round' }}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>

        <div class="game-footer">
          <span class="footer-tip"><kbd>1–9</kbd> pick a hole</span>
          <span class="footer-center">ONE HIT. ONE POINT. NO MERCY.</span>
          <span class="footer-tip"><kbd>R</kbd> restart</span>
        </div>
      </div>

      <footer class="page-footer">
        <span>MADE OF PIXELS &amp; PURE REFLEX</span>
        <span>TAKE A BREATH. THEN TAKE YOUR SHOT.</span>
      </footer>
    </section>
  </main>
</template>
