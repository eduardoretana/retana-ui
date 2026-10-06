"use client"

/**
 * React provider around cuelume@0.2.4 (MIT, Copyright (c) 2026 Daniel Belyi).
 * https://github.com/danielwh2/cuelume
 *
 * The published 0.2.4 tarball (git caf15480081da9432a4a982446ce44c9daf3a288)
 * already contains the 14-cue palette the README describes as v0.3, plus the
 * legacy aliases. The package version was not bumped. This item depends on
 * that pin instead of vendoring main, which is still labeled 0.2.4.
 * cuelume leaves preference storage to the app. This wrapper persists mute,
 * volume, theme, and emphasis, and refuses to play before a user gesture.
 */

import * as React from "react"
import {
  play,
  setEnabled,
  setTheme,
  setVolume,
  sounds,
  themes,
  type Emphasis,
  type PlayOptions,
  type SoundName,
  type ThemeName,
} from "cuelume"

import { cn } from "@/lib/utils"

export { sounds, themes }
export type { Emphasis, PlayOptions, SoundName, ThemeName }

export type UiSoundPrefs = {
  muted: boolean
  volume: number
  theme: ThemeName
  emphasis: Emphasis
}

const STORAGE_KEY = "retana-ui-sounds"
const LEGACY_MUTE_KEY = "retana-press-muted"

const EMPHASIS: readonly Emphasis[] = ["subtle", "normal", "strong"]

let prefs: UiSoundPrefs = { muted: false, volume: 1, theme: "default", emphasis: "normal" }
let hydrated = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function clampVolume(value: number) {
  if (!Number.isFinite(value)) return prefs.volume
  return Math.min(1, Math.max(0, value))
}

function isTheme(value: unknown): value is ThemeName {
  return typeof value === "string" && (themes as readonly string[]).includes(value)
}

function isEmphasis(value: unknown): value is Emphasis {
  return typeof value === "string" && (EMPHASIS as readonly string[]).includes(value)
}

function applyEngine() {
  setEnabled(!prefs.muted)
  setVolume(prefs.volume)
  setTheme(prefs.theme)
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    localStorage.setItem(LEGACY_MUTE_KEY, prefs.muted ? "1" : "0")
  } catch {
    /* storage may be blocked */
  }
}

function commit(next: UiSoundPrefs) {
  prefs = next
  applyEngine()
  persist()
  emit()
}

export function subscribeUiSounds(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getUiSoundPrefs(): UiSoundPrefs {
  return prefs
}

export function getUiSoundMuted() {
  return prefs.muted
}

export function hydrateUiSounds() {
  if (hydrated || typeof window === "undefined") return
  hydrated = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UiSoundPrefs>
      prefs = {
        muted: parsed.muted === true,
        volume: clampVolume(typeof parsed.volume === "number" ? parsed.volume : 1),
        theme: isTheme(parsed.theme) ? parsed.theme : "default",
        emphasis: isEmphasis(parsed.emphasis) ? parsed.emphasis : "normal",
      }
    } else if (localStorage.getItem(LEGACY_MUTE_KEY) === "1") {
      prefs = { ...prefs, muted: true }
    }
  } catch {
    /* keep defaults */
  }
  applyEngine()
  emit()
}

export function setUiSoundMuted(muted: boolean) {
  commit({ ...prefs, muted })
}

export function setUiSoundVolume(volume: number) {
  commit({ ...prefs, volume: clampVolume(volume) })
}

export function setUiSoundTheme(theme: ThemeName) {
  if (!isTheme(theme)) return
  commit({ ...prefs, theme })
}

export function setUiSoundEmphasis(emphasis: Emphasis) {
  if (!isEmphasis(emphasis)) return
  commit({ ...prefs, emphasis })
}

function gestureAllowed() {
  if (typeof navigator === "undefined") return false
  const activation = navigator.userActivation
  if (activation && activation.hasBeenActive === false) return false
  return true
}

/** Plays a cue. No-ops when muted, before a user gesture, or without Web Audio. */
export function playUiSound(name: SoundName = "tap", options?: PlayOptions) {
  if (prefs.muted || !gestureAllowed()) return
  play(name, { emphasis: prefs.emphasis, theme: prefs.theme, ...options })
}

export function useUiSounds() {
  const snapshot = React.useSyncExternalStore(subscribeUiSounds, getUiSoundPrefs, () => prefs)

  React.useEffect(() => {
    hydrateUiSounds()
  }, [])

  return {
    ...snapshot,
    sounds,
    themes,
    setMuted: setUiSoundMuted,
    setVolume: setUiSoundVolume,
    setTheme: setUiSoundTheme,
    setEmphasis: setUiSoundEmphasis,
    play: playUiSound,
    toggle() {
      setUiSoundMuted(!getUiSoundMuted())
    },
  }
}

export function UiSoundsProvider({
  children,
  muted,
  volume,
  theme,
  emphasis,
}: {
  children: React.ReactNode
  /** Controlled mute. Omit to use the stored preference. */
  muted?: boolean
  volume?: number
  theme?: ThemeName
  emphasis?: Emphasis
}) {
  React.useEffect(() => {
    hydrateUiSounds()
    if (muted !== undefined) setUiSoundMuted(muted)
    if (volume !== undefined) setUiSoundVolume(volume)
    if (theme !== undefined) setUiSoundTheme(theme)
    if (emphasis !== undefined) setUiSoundEmphasis(emphasis)
  }, [muted, volume, theme, emphasis])

  return children
}

export function UiSoundsToggle({
  mutedLabel = "Unmute sounds",
  unmutedLabel = "Mute sounds",
  className,
}: {
  mutedLabel?: string
  unmutedLabel?: string
  className?: string
}) {
  const sound = useUiSounds()
  return (
    <button
      type="button"
      className={className}
      aria-pressed={sound.muted}
      onClick={() => sound.toggle()}
    >
      {sound.muted ? mutedLabel : unmutedLabel}
    </button>
  )
}

export function UiSoundsControls({
  className,
  muteClassName,
}: {
  className?: string
  muteClassName?: string
}) {
  const sound = useUiSounds()
  return (
    <div className={cn("flex flex-col gap-3 text-sm", className)}>
      <UiSoundsToggle
        className={cn(
          "w-fit rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground",
          muteClassName,
        )}
      />
      <label className="flex items-center gap-3">
        <span className="w-16 text-muted-foreground">Volume</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={sound.volume}
          aria-valuetext={`${Math.round(sound.volume * 100)} percent`}
          onChange={(event) => sound.setVolume(Number(event.target.value))}
          className="w-40 accent-primary"
        />
      </label>
      <label className="flex items-center gap-3">
        <span className="w-16 text-muted-foreground">Theme</span>
        <select
          value={sound.theme}
          onChange={(event) => sound.setTheme(event.target.value as ThemeName)}
          className="rounded-md border border-border bg-background px-2 py-1"
        >
          {themes.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-3">
        <span className="w-16 text-muted-foreground">Weight</span>
        <select
          value={sound.emphasis}
          aria-label="Emphasis"
          onChange={(event) => sound.setEmphasis(event.target.value as Emphasis)}
          className="rounded-md border border-border bg-background px-2 py-1"
        >
          {EMPHASIS.map((emphasis) => (
            <option key={emphasis} value={emphasis}>
              {emphasis}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
