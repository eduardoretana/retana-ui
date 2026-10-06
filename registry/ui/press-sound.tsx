"use client"

/**
 * Compatibility facade over ui-sounds (cuelume). The public exports are unchanged.
 * tap, tick, and pop map onto cuelume cues. Mute still uses the shared store
 * and the legacy `retana-press-muted` key.
 */

import * as React from "react"

import {
  getUiSoundMuted,
  hydrateUiSounds,
  playUiSound,
  setUiSoundMuted,
  subscribeUiSounds,
  useUiSounds,
} from "@/registry/retana/ui/ui-sounds"

export type PressSoundName = "tap" | "tick" | "pop"

const CUE = {
  tap: "tap",
  tick: "select",
  pop: "toggle",
} as const

export function subscribePressSound(listener: () => void) {
  return subscribeUiSounds(listener)
}

export function getPressSoundMuted() {
  return getUiSoundMuted()
}

export function setPressSoundMuted(next: boolean) {
  setUiSoundMuted(next)
}

export function hydratePressSound() {
  hydrateUiSounds()
}

export function playPressSound(name: PressSoundName = "tap") {
  playUiSound(CUE[name], name === "pop" ? { emphasis: "strong" } : undefined)
}

export function usePressSound() {
  const sound = useUiSounds()
  return {
    muted: sound.muted,
    setMuted: setPressSoundMuted,
    play: playPressSound,
    toggle() {
      setPressSoundMuted(!getPressSoundMuted())
    },
  }
}

export function PressSound({
  children,
  sound = "tap",
  disabled = false,
}: {
  children: React.ReactElement<{ onPointerDown?: (event: React.PointerEvent) => void }>
  sound?: PressSoundName
  disabled?: boolean
}) {
  return React.cloneElement(children, {
    onPointerDown: (event: React.PointerEvent) => {
      children.props.onPointerDown?.(event)
      if (!disabled && event.button === 0) playPressSound(sound)
    },
  })
}

export function PressSoundToggle({
  mutedLabel = "Unmute clicks",
  unmutedLabel = "Mute clicks",
  className,
}: {
  mutedLabel?: string
  unmutedLabel?: string
  className?: string
}) {
  const sound = usePressSound()
  return (
    <button type="button" className={className} aria-pressed={sound.muted} onClick={() => sound.toggle()}>
      {sound.muted ? mutedLabel : unmutedLabel}
    </button>
  )
}
