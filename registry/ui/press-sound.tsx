"use client"

import * as React from "react"

export type PressSoundName = "tap" | "tick" | "pop"

const STORAGE_KEY = "retana-press-muted"

let muted = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribePressSound(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getPressSoundMuted() {
  return muted
}

export function setPressSoundMuted(next: boolean) {
  muted = next
  try {
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
  } catch {
    /* storage may be blocked */
  }
  emit()
}

export function hydratePressSound() {
  try {
    muted = localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    muted = false
  }
  emit()
}

let audio: AudioContext | null = null

function context() {
  if (typeof window === "undefined") return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  audio ??= new Ctor()
  if (audio.state === "suspended") void audio.resume()
  return audio
}

function blip(ctx: AudioContext, frequency: number, duration: number, type: OscillatorType, amount: number) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
  gain.gain.setValueAtTime(amount, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start()
  oscillator.stop(ctx.currentTime + duration)
  return oscillator
}

export function playPressSound(name: PressSoundName = "tap") {
  if (muted) return
  const ctx = context()
  if (!ctx) return
  if (name === "tick") {
    blip(ctx, 880, 0.04, "square", 0.04)
    return
  }
  if (name === "pop") {
    const oscillator = blip(ctx, 240, 0.12, "sine", 0.08)
    oscillator.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.12)
    return
  }
  blip(ctx, 620, 0.07, "triangle", 0.06)
}

export function usePressSound() {
  const silent = React.useSyncExternalStore(subscribePressSound, getPressSoundMuted, () => false)

  React.useEffect(() => {
    hydratePressSound()
  }, [])

  return {
    muted: silent,
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
