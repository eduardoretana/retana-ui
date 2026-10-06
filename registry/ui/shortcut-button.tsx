"use client"

/**
 * Copyright 2026 radiumcoders
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Adapted from Evil Buttons command-button (Apache-2.0).
 * https://github.com/radiumcoders/Evil-Buttons
 * Upstream commit ec0fa86f8d06. The upstream repository has no NOTICE file.
 *
 * Modifications (Retana UI, 2026):
 * - Renamed CommandButton to ShortcutButton.
 * - Replaced hardcoded colors with the host button and semantic tokens.
 * - Keycap travel is skipped when the reader prefers reduced motion.
 */

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ShortcutButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
> & {
  /** Shortcut like `"mod+s"`. `mod` is ⌘ on Apple devices and Ctrl elsewhere. */
  shortcut?: string
  /** Fired when the keyboard shortcut is pressed. */
  onCommand?: () => void
  /** Stop the browser's own handling of the shortcut. */
  preventDefault?: boolean
  /** Show the shortcut as keycaps inside the button. */
  showShortcut?: boolean
}

const MODIFIERS = ["mod", "ctrl", "alt", "shift"] as const
const FIRE_MS = 160

function normalizeKey(value: string) {
  const key = value.toLowerCase()
  if (key === "cmd" || key === "command" || key === "meta") return "mod"
  if (key === "control") return "ctrl"
  if (key === "option") return "alt"
  if (key === "escape") return "esc"
  if (key === "return") return "enter"
  if (key === " " || key === "spacebar") return "space"
  return key
}

function parseShortcut(shortcut: string) {
  return shortcut
    .split("+")
    .map((part) => normalizeKey(part.trim()))
    .filter(Boolean)
}

function shortcutMatches(event: KeyboardEvent, parts: string[]) {
  const wantsMod = parts.includes("mod")
  const wantsCtrl = parts.includes("ctrl")
  const finalKey = parts.find((part) => !(MODIFIERS as readonly string[]).includes(part))
  if (wantsMod && !(event.metaKey || event.ctrlKey)) return false
  if (!wantsMod && wantsCtrl !== event.ctrlKey) return false
  if (parts.includes("alt") !== event.altKey) return false
  if (parts.includes("shift") !== event.shiftKey) return false
  return finalKey ? normalizeKey(event.key) === finalKey : false
}

function partHeld(part: string, event: KeyboardEvent, isApple: boolean) {
  if (part === "mod") return isApple ? event.metaKey : event.ctrlKey
  if (part === "ctrl") return event.ctrlKey
  if (part === "alt") return event.altKey
  if (part === "shift") return event.shiftKey
  return false
}

function formatPart(part: string, isApple: boolean) {
  if (part === "mod") return isApple ? "⌘" : "Ctrl"
  if (part === "ctrl") return isApple ? "⌃" : "Ctrl"
  if (part === "alt") return isApple ? "⌥" : "Alt"
  if (part === "shift") return isApple ? "⇧" : "Shift"
  if (part === "enter") return "↵"
  if (part === "esc") return "Esc"
  if (part === "space") return "Space"
  if (part === "arrowup") return "↑"
  if (part === "arrowdown") return "↓"
  if (part === "arrowleft") return "←"
  if (part === "arrowright") return "→"
  return part.length === 1 ? part.toUpperCase() : part
}

function detectApple() {
  if (typeof navigator === "undefined") return false
  return /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent)
}

function subscribeApple() {
  return () => {}
}

export function ShortcutButton({
  shortcut = "mod+s",
  onCommand,
  preventDefault = true,
  showShortcut = true,
  className,
  children = "Save",
  disabled,
  onClick,
  type = "button",
  variant = "default",
  ...props
}: ShortcutButtonProps) {
  const parts = React.useMemo(() => parseShortcut(shortcut), [shortcut])
  const isApple = React.useSyncExternalStore(subscribeApple, detectApple, () => false)
  const [held, setHeld] = React.useState<ReadonlySet<string>>(new Set())
  const [firing, setFiring] = React.useState(false)
  const fireTimerRef = React.useRef<number | undefined>(undefined)
  const onCommandRef = React.useRef(onCommand)

  React.useEffect(() => {
    onCommandRef.current = onCommand
  }, [onCommand])

  const fire = React.useCallback(() => {
    setFiring(true)
    window.clearTimeout(fireTimerRef.current)
    fireTimerRef.current = window.setTimeout(() => setFiring(false), FIRE_MS)
  }, [])

  React.useEffect(() => {
    if (disabled) return
    const syncModifiers = (event: KeyboardEvent) => {
      const next = new Set(parts.filter((part) => partHeld(part, event, isApple)))
      setHeld((current) =>
        current.size === next.size && [...next].every((part) => current.has(part)) ? current : next,
      )
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      syncModifiers(event)
      if (event.repeat || !shortcutMatches(event, parts)) return
      if (preventDefault) event.preventDefault()
      fire()
      onCommandRef.current?.()
    }
    const clear = () => setHeld(new Set())
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", syncModifiers)
    window.addEventListener("blur", clear)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", syncModifiers)
      window.removeEventListener("blur", clear)
      clear()
    }
  }, [disabled, fire, isApple, parts, preventDefault])

  React.useEffect(() => () => window.clearTimeout(fireTimerRef.current), [])

  const label = parts.map((part) => formatPart(part, isApple)).join(" ")
  const capTone = variant === "default" || variant === "destructive"
    ? "bg-primary-foreground/15 text-primary-foreground"
    : "bg-muted text-muted-foreground"

  return (
    <Button
      type={type}
      disabled={disabled}
      variant={variant}
      data-shortcut={shortcut}
      data-firing={firing || undefined}
      data-slot="shortcut-button"
      aria-keyshortcuts={parts.map((part) => (part === "mod" ? (isApple ? "Meta" : "Control") : part)).join("+")}
      onClick={(event) => {
        onClick?.(event)
      }}
      className={cn("group/cmd gap-2 motion-reduce:active:translate-y-0", showShortcut && "pr-1.5", className)}
      {...props}
    >
      <span>{children}</span>
      {showShortcut ? (
        <kbd aria-label={label} className="inline-flex items-center gap-0.5 font-sans">
          {parts.map((part) => (
            <span
              key={part}
              aria-hidden
              data-pressed={held.has(part) || undefined}
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-sm px-1 text-[11px] leading-none font-medium",
                capTone,
                "transition-transform duration-150 motion-reduce:transition-none",
                "data-pressed:translate-y-px group-active/cmd:translate-y-px group-data-firing/cmd:translate-y-px",
                "motion-reduce:data-pressed:translate-y-0 motion-reduce:group-active/cmd:translate-y-0",
              )}
            >
              {formatPart(part, isApple)}
            </span>
          ))}
        </kbd>
      ) : null}
    </Button>
  )
}
