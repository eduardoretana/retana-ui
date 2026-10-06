"use client"

/**
 * Haptics provider adapted from seamui (MIT).
 * Copyright (c) 2026 Mikhail Villamor. https://github.com/meiskv/seamui
 * Upstream commit 7c57149f327d, registry item `haptics`.
 *
 * Modifications: playback uses `navigator.vibrate` and is a no-op where the
 * Vibration API is missing (including iOS Safari). The `web-haptics` package
 * is not a dependency. Mute is persisted. Nothing vibrates until the caller
 * asks, and never on mount.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

export type HapticPreset = "tap" | "tick" | "success" | "error" | "warning" | "attention"

const PATTERNS: Record<HapticPreset, number | number[]> = {
  tap: 10,
  tick: 6,
  success: [12, 40, 18],
  error: [28, 40, 28],
  warning: [16, 36, 16],
  attention: [18, 40, 18, 40, 24],
}

const STORAGE_KEY = "retana-haptics-muted"

let muted = false
let hydrated = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribeHaptics(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getHapticsMuted() {
  return muted
}

export function vibrateSupported() {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function"
}

export function hydrateHaptics() {
  if (hydrated || typeof window === "undefined") return
  hydrated = true
  try {
    muted = localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    muted = false
  }
  emit()
}

export function setHapticsMuted(next: boolean) {
  muted = next
  try {
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
  } catch {
    /* storage may be blocked */
  }
  emit()
}

/** Vibrates when the API exists and haptics are not muted. Never throws. */
export function triggerHaptic(preset: HapticPreset = "tap") {
  if (muted || !vibrateSupported()) return
  try {
    navigator.vibrate(PATTERNS[preset])
  } catch {
    /* device rejected the pattern */
  }
}

export function useHaptics() {
  const silent = React.useSyncExternalStore(subscribeHaptics, getHapticsMuted, () => false)
  React.useEffect(() => {
    hydrateHaptics()
  }, [])
  return {
    muted: silent,
    supported: vibrateSupported(),
    setMuted: setHapticsMuted,
    trigger: triggerHaptic,
    toggle() {
      setHapticsMuted(!getHapticsMuted())
    },
  }
}

export function HapticsProvider({
  children,
  muted: mutedProp,
}: {
  children: React.ReactNode
  /** Controlled mute. Omit to use the stored preference. */
  muted?: boolean
}) {
  React.useEffect(() => {
    hydrateHaptics()
    if (mutedProp !== undefined) setHapticsMuted(mutedProp)
  }, [mutedProp])
  return children
}

export function HapticsToggle({
  mutedLabel = "Enable haptics",
  unmutedLabel = "Disable haptics",
  className,
}: {
  mutedLabel?: string
  unmutedLabel?: string
  className?: string
}) {
  const haptics = useHaptics()
  return (
    <button
      type="button"
      className={cn(
        "rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      aria-pressed={haptics.muted}
      onClick={() => haptics.toggle()}
    >
      {haptics.muted ? mutedLabel : unmutedLabel}
    </button>
  )
}
