"use client"

/** Stub del commit rojo: exporta la forma pública y falla. La pieza llega en el commit verde. */

export type TextScrambleTrigger = "mount" | "visible"

export type TextScrambleProps = {
  text: string
  as?: "h1" | "h2" | "h3" | "p" | "span"
  trigger?: TextScrambleTrigger
  duration?: number
  delay?: number
  charset?: string
  onDecoded?: () => void
  className?: string
  id?: string
}

export const SCRAMBLE_GLYPHS = ""
export const SCRAMBLE_TICK_MS = 0
export const SCRAMBLE_MAX_CHARS = 0

const notImplemented = (): never => {
  throw new Error("text-scramble: not implemented")
}

export function scrambleDuration(_ms?: number): number {
  return notImplemented()
}

export function scrambleSchedule(_text: string): number[] {
  return notImplemented()
}

export function scrambleFrame(_text: string, _progress: number, _schedule: readonly number[], _tick: number, _charset?: string): string {
  return notImplemented()
}

export function TextScramble(_props: TextScrambleProps): never {
  return notImplemented()
}
