"use client"

/**
 * One gesture, three channels: a cuelume cue, an optional vibration, and a
 * motion hint. Sound and haptics stay independently mutable. Nothing runs
 * on mount. Reduced motion drops the animation hint only.
 */

import { triggerHaptic, type HapticPreset } from "@/registry/retana/ui/haptics"
import { useMotionPreference } from "@/registry/retana/ui/motion-preference"
import { playUiSound, useUiSounds, type Emphasis, type SoundName } from "@/registry/retana/ui/ui-sounds"

export type FeedbackIntent =
  | "tap"
  | "toggle"
  | "open"
  | "close"
  | "select"
  | "navigate"
  | "type"
  | "success"
  | "warning"
  | "error"
  | "loading"
  | "ready"
  | "attention"
  | "confirm"

type Row = { sound: SoundName; haptic: HapticPreset; emphasis?: Emphasis }

const INTENTS: Record<FeedbackIntent, Row> = {
  tap: { sound: "tap", haptic: "tap" },
  toggle: { sound: "toggle", haptic: "tick" },
  open: { sound: "open", haptic: "tap" },
  close: { sound: "close", haptic: "tick" },
  select: { sound: "select", haptic: "tick" },
  navigate: { sound: "navigate", haptic: "tap" },
  type: { sound: "type", haptic: "tick" },
  success: { sound: "success", haptic: "success" },
  warning: { sound: "warning", haptic: "warning" },
  error: { sound: "error", haptic: "error" },
  loading: { sound: "loading", haptic: "tick" },
  ready: { sound: "ready", haptic: "tap" },
  attention: { sound: "attention", haptic: "attention" },
  confirm: { sound: "success", haptic: "success", emphasis: "strong" },
}

export type FeedbackMotion = {
  scale?: number | number[]
  x?: number | number[]
  transition: { duration: number }
}

export function feedbackMotion(intent: FeedbackIntent, reduced: boolean): FeedbackMotion {
  if (reduced) return { scale: 1, transition: { duration: 0 } }
  if (intent === "error") return { x: [0, -3, 3, 0], transition: { duration: 0.28 } }
  if (intent === "success" || intent === "confirm") return { scale: [1, 1.04, 1], transition: { duration: 0.28 } }
  return { scale: [1, 0.98, 1], transition: { duration: 0.16 } }
}

export function triggerFeedback(
  intent: FeedbackIntent,
  options?: { sound?: boolean; haptic?: boolean },
) {
  const row = INTENTS[intent]
  if (options?.sound !== false) {
    playUiSound(row.sound, row.emphasis ? { emphasis: row.emphasis } : undefined)
  }
  if (options?.haptic !== false) triggerHaptic(row.haptic)
}

export function useFeedback() {
  const sounds = useUiSounds()
  const reduced = useMotionPreference()
  return {
    muted: sounds.muted,
    reduced,
    trigger: triggerFeedback,
    motion: (intent: FeedbackIntent) => feedbackMotion(intent, reduced),
  }
}
