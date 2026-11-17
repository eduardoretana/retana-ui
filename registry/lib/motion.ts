/**
 * Timing presets for pieces adapted from Arc UI (MIT).
 * Durations and springs only. No colors, fonts, or theme tokens.
 */
export const motionPresets = {
  duration: {
    instant: 0.12,
    fast: 0.16,
    exit: 0.18,
    standard: 0.24,
    considered: 0.48,
  },
  ease: {
    enter: [0.16, 1, 0.3, 1] as const,
    // Exit decelerates, the same curve as CSS ease-out.
    exit: [0, 0, 0.58, 1] as const,
    standard: [0.22, 1, 0.36, 1] as const,
    inOut: [0.65, 0, 0.35, 1] as const,
  },
  spring: {
    responsive: { type: "spring" as const, stiffness: 520, damping: 38 },
    gentle: { type: "spring" as const, stiffness: 340, damping: 34 },
    snappy: { type: "spring" as const, visualDuration: 0.26, bounce: 0.12 },
    smooth: { type: "spring" as const, visualDuration: 0.4, bounce: 0 },
    morph: { type: "spring" as const, visualDuration: 0.42, bounce: 0.16 },
  },
  stagger: { char: 0.016, word: 0.04, line: 0.08, item: 0.035, marketing: 0.12 },
  blur: { subtle: 2, soft: 4, text: 8 },
}

/**
 * Choreography budgets adapted from Emil Kowalski's choreograph skill (MIT).
 * Copyright (c) 2026 Emil Kowalski. https://github.com/emilkowalski/skills
 * Pinned at c8a79627b59d72d764d6ab6f2c87c09a48169833.
 * Product steps stay inside 30–80ms and the group's delay stays under ~300ms.
 * Marketing steps sit in 100–150ms. Later gaps shrink, and items past the cap
 * share the last delay so a long list never waits N times the step.
 */
export const choreography = {
  productStep: 0.05,
  productCeiling: 0.3,
  marketingStep: 0.12,
  marketingCeiling: 0.6,
  cap: 6,
  decay: 0.72,
  resizeMin: 0.15,
  resizeMax: 0.27,
  resizePerPx: 500,
  attentionDelay: 2.5,
  attentionRepeat: 6,
} as const

export function staggerDelaySeconds(
  index: number,
  options?: { step?: number; cap?: number; decay?: number; ceiling?: number },
) {
  const step = options?.step ?? choreography.productStep
  const cap = options?.cap ?? choreography.cap
  const decay = options?.decay ?? choreography.decay
  const ceiling = options?.ceiling ?? (step >= 0.1 ? choreography.marketingCeiling : choreography.productCeiling)
  const slot = Math.max(0, Math.min(Math.floor(index), Math.max(cap, 1) - 1))
  let delay = 0
  for (let i = 0; i < slot; i += 1) delay += step * Math.pow(decay, i)
  return Math.min(delay, ceiling)
}

/** Fade length for a container whose height changed. `clamp(0.15s, Δpx/500, 0.27s)`. */
export function resizeFadeDuration(deltaPx: number) {
  const delta = Math.abs(deltaPx)
  if (!Number.isFinite(delta)) return choreography.resizeMin
  return Math.min(Math.max(delta / choreography.resizePerPx, choreography.resizeMin), choreography.resizeMax)
}
