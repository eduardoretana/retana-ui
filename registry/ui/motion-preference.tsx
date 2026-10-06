"use client"

/**
 * Motion preference adapted from seamui (MIT).
 * Copyright (c) 2026 Mikhail Villamor. https://github.com/meiskv/seamui
 * Upstream commit 7c57149f327d, `useReducedMotion` in registry item `motion`.
 *
 * Resolution order matches that hook:
 *   1. an explicit user choice (`reduce` or `full`);
 *   2. the operating system `prefers-reduced-motion` query.
 * `MotionConfig reducedMotion: "never"` is ignored, as in seamui, because that
 * value is motion's default and cannot be told apart from "no provider".
 *
 * Modification: the choice is persisted, and the hook works without a provider.
 * Springs, depth tokens, and the rest of seamui's motion theme are not included.
 */

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export type MotionPreference = "system" | "reduce" | "full"

const STORAGE_KEY = "retana-motion-preference"
const OPTIONS: { value: MotionPreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "reduce", label: "Reduce" },
  { value: "full", label: "Full" },
]

let preference: MotionPreference = "system"
let hydrated = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function isPreference(value: unknown): value is MotionPreference {
  return value === "system" || value === "reduce" || value === "full"
}

export function subscribeMotionPreference(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getMotionPreference() {
  return preference
}

export function hydrateMotionPreference() {
  if (hydrated || typeof window === "undefined") return
  hydrated = true
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isPreference(stored)) preference = stored
  } catch {
    preference = "system"
  }
  emit()
}

export function setMotionPreference(next: MotionPreference) {
  if (!isPreference(next)) return
  preference = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* storage may be blocked */
  }
  emit()
}

/** True when motion should be reduced, including a stored user override. */
export function useMotionPreference() {
  const stored = React.useSyncExternalStore(subscribeMotionPreference, getMotionPreference, () => "system" as const)
  const system = useReducedMotion() ?? false
  React.useEffect(() => {
    hydrateMotionPreference()
  }, [])
  if (stored === "reduce") return true
  if (stored === "full") return false
  return system
}

export function MotionPreferenceProvider({
  children,
  preference: preferenceProp,
}: {
  children: React.ReactNode
  preference?: MotionPreference
}) {
  React.useEffect(() => {
    hydrateMotionPreference()
    if (preferenceProp !== undefined) setMotionPreference(preferenceProp)
  }, [preferenceProp])
  return children
}

export function MotionPreferenceControl({
  className,
  label = "Motion",
}: {
  className?: string
  label?: string
}) {
  const stored = React.useSyncExternalStore(subscribeMotionPreference, getMotionPreference, () => "system" as const)
  React.useEffect(() => {
    hydrateMotionPreference()
  }, [])
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} role="radiogroup" aria-label={label}>
      <span className="text-sm text-muted-foreground">{label}</span>
      {OPTIONS.map((option) => {
        const selected = stored === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={cn(
              "rounded-md border px-2 py-1 text-sm",
              selected ? "border-border bg-muted text-foreground" : "border-transparent text-muted-foreground hover:bg-muted",
            )}
            onClick={() => setMotionPreference(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
