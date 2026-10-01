"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { Variants } from "motion/react"
import { RotateCcw, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type Platform = "mac" | "other"
export interface ShortcutToken {
  label: string
  id: string
  spoken: string
}

const MODIFIER_ORDER = ["mod", "ctrl", "alt", "shift", "meta"] as const
type Modifier = (typeof MODIFIER_ORDER)[number]
const isModifier = (part: string): part is Modifier => (MODIFIER_ORDER as readonly string[]).includes(part)

const CODE_KEYS: Record<string, string> = {
  Comma: ",",
  Period: ".",
  Slash: "/",
  Semicolon: ";",
  Quote: "'",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Minus: "-",
  Equal: "=",
  Backquote: "`",
  Space: "space",
  Enter: "enter",
  NumpadEnter: "enter",
  Escape: "escape",
  Backspace: "backspace",
  Delete: "delete",
  Tab: "tab",
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Home: "home",
  End: "end",
  PageUp: "pageup",
  PageDown: "pagedown",
}
const MODIFIER_KEYS: Record<string, string> = { Meta: "meta", OS: "meta", Control: "ctrl", Alt: "alt", AltGraph: "alt", Shift: "shift" }

/** The physical key id for an event. `null` for keys that never make a shortcut, such as Caps Lock. */
export function keyId(event: Pick<KeyboardEvent, "key" | "code">): string | null {
  const { code, key } = event
  if (MODIFIER_KEYS[key]) return MODIFIER_KEYS[key]
  if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase()
  if (/^Digit\d$/.test(code)) return code.slice(5)
  if (/^Numpad\d$/.test(code)) return code.slice(6)
  if (CODE_KEYS[code]) return CODE_KEYS[code]
  if (/^F\d{1,2}$/.test(key)) return key.toLowerCase()
  if (key === "CapsLock" || key === "Fn" || key === "Dead" || key === "Unidentified" || key === "Process") return null
  return key.length === 1 ? key.toLowerCase() : null
}

function splitShortcut(shortcut: string) {
  const parts = shortcut
    .toLowerCase()
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean)
  const key = parts.filter((part) => !isModifier(part)).pop() ?? ""
  return { mods: new Set(parts.filter(isModifier)), key }
}

/** One spelling per combination. Modifiers come in a fixed order. */
export function normalizeShortcut(shortcut: string, platform: Platform) {
  const { mods, key } = splitShortcut(shortcut)
  if (platform === "mac" && mods.delete("meta")) mods.add("mod")
  if (platform === "other" && mods.delete("ctrl")) mods.add("mod")
  return [...MODIFIER_ORDER.filter((mod) => mods.has(mod)), key].filter(Boolean).join("+")
}

/** Reads a keydown into a shortcut string, or `null` while only modifiers are down. */
export function shortcutFromEvent(event: Pick<KeyboardEvent, "key" | "code" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey">, platform: Platform) {
  const key = keyId(event)
  if (!key || ["meta", "ctrl", "alt", "shift"].includes(key)) return null
  const mods: string[] = []
  if (platform === "mac" ? event.metaKey : event.ctrlKey) mods.push("mod")
  if (platform === "mac" ? event.ctrlKey : false) mods.push("ctrl")
  if (event.altKey) mods.push("alt")
  if (event.shiftKey) mods.push("shift")
  if (platform === "other" && event.metaKey) mods.push("meta")
  return normalizeShortcut([...mods, key].join("+"), platform)
}

/** True when a keydown is this shortcut. */
export function matchesShortcut(event: Pick<KeyboardEvent, "key" | "code" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey">, shortcut: string, platform: Platform) {
  const pressed = shortcutFromEvent(event, platform)
  return !!pressed && pressed === normalizeShortcut(shortcut, platform)
}

const MAC_KEYS: Record<string, [string, string]> = {
  enter: ["↩", "Return"],
  backspace: ["⌫", "Delete"],
  delete: ["⌦", "Forward delete"],
  tab: ["⇥", "Tab"],
  escape: ["esc", "Escape"],
}
const SHARED_KEYS: Record<string, [string, string]> = {
  space: ["Space", "Space"],
  enter: ["Enter", "Enter"],
  escape: ["Esc", "Escape"],
  backspace: ["Backspace", "Backspace"],
  delete: ["Del", "Delete"],
  tab: ["Tab", "Tab"],
  up: ["↑", "Up arrow"],
  down: ["↓", "Down arrow"],
  left: ["←", "Left arrow"],
  right: ["→", "Right arrow"],
  home: ["Home", "Home"],
  end: ["End", "End"],
  pageup: ["PgUp", "Page up"],
  pagedown: ["PgDn", "Page down"],
  ",": [",", "Comma"],
  ".": [".", "Period"],
  "/": ["/", "Slash"],
  ";": [";", "Semicolon"],
  "'": ["'", "Quote"],
  "[": ["[", "Left bracket"],
  "]": ["]", "Right bracket"],
  "\\": ["\\", "Backslash"],
  "-": ["-", "Minus"],
  "=": ["=", "Equals"],
  "`": ["`", "Backtick"],
}

/** Key caps for a shortcut in platform order. */
export function shortcutTokens(shortcut: string, platform: Platform): ShortcutToken[] {
  const { mods, key } = splitShortcut(normalizeShortcut(shortcut, platform))
  const tokens: ShortcutToken[] = []
  if (platform === "mac") {
    if (mods.has("ctrl")) tokens.push({ label: "⌃", id: "ctrl", spoken: "Control" })
    if (mods.has("alt")) tokens.push({ label: "⌥", id: "alt", spoken: "Option" })
    if (mods.has("shift")) tokens.push({ label: "⇧", id: "shift", spoken: "Shift" })
    if (mods.has("mod") || mods.has("meta")) tokens.push({ label: "⌘", id: "meta", spoken: "Command" })
  } else {
    if (mods.has("mod") || mods.has("ctrl")) tokens.push({ label: "Ctrl", id: "ctrl", spoken: "Control" })
    if (mods.has("alt")) tokens.push({ label: "Alt", id: "alt", spoken: "Alt" })
    if (mods.has("shift")) tokens.push({ label: "Shift", id: "shift", spoken: "Shift" })
    if (mods.has("meta")) tokens.push({ label: "Win", id: "meta", spoken: "Windows" })
  }
  if (key) {
    const named = (platform === "mac" ? MAC_KEYS[key] : undefined) ?? SHARED_KEYS[key]
    tokens.push(named ? { label: named[0], id: key, spoken: named[1] } : { label: key.toUpperCase(), id: key, spoken: key.toUpperCase() })
  }
  return tokens
}

/** A readable label plus a spoken form. */
export function formatShortcut(shortcut: string, platform: Platform) {
  const tokens = shortcutTokens(shortcut, platform)
  return { text: tokens.map((token) => token.label).join(platform === "mac" ? "" : "+"), spoken: tokens.map((token) => token.spoken).join(" ") }
}

const subscribe = () => () => {}
function useReducedFlag() {
  const hydrated = React.useSyncExternalStore(subscribe, () => true, () => false)
  return !!useReducedMotion() && hydrated
}
const detectPlatform = (): Platform => {
  if (typeof navigator === "undefined") return "mac"
  const hint = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform ?? navigator.userAgent
  return /mac|iphone|ipad|ipod/i.test(hint) ? "mac" : "other"
}

/** The viewer's platform. Server renders assume a Mac and settle on the first client render. */
export function usePlatform(override?: Platform): Platform {
  const detected = React.useSyncExternalStore(subscribe, detectPlatform, () => "mac" as Platform)
  return override ?? detected
}

const EMPTY: ReadonlySet<string> = new Set()

/** Keys held down right now, by physical id. */
export function usePressedKeys(enabled = true) {
  const [held, setHeld] = React.useState<ReadonlySet<string>>(() => new Set())
  React.useEffect(() => {
    if (!enabled) return
    const update = (change: (next: Set<string>) => void) =>
      setHeld((current) => {
        const next = new Set(current)
        change(next)
        return next.size === current.size && [...next].every((key) => current.has(key)) ? current : next
      })
    const down = (event: KeyboardEvent) => {
      const id = keyId(event)
      if (id) update((next) => next.add(id))
    }
    const up = (event: KeyboardEvent) => {
      const id = keyId(event)
      update((next) => {
        if (id) next.delete(id)
        if (id === "meta") [...next].forEach((key) => {
          if (!["ctrl", "alt", "shift"].includes(key)) next.delete(key)
        })
        if (!event.metaKey) next.delete("meta")
        if (!event.ctrlKey) next.delete("ctrl")
        if (!event.altKey) next.delete("alt")
        if (!event.shiftKey) next.delete("shift")
      })
    }
    const clear = () => setHeld((current) => (current.size ? new Set() : current))
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    window.addEventListener("blur", clear)
    document.addEventListener("visibilitychange", clear)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
      window.removeEventListener("blur", clear)
      document.removeEventListener("visibilitychange", clear)
    }
  }, [enabled])
  return enabled ? held : EMPTY
}

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  pressed?: boolean
  size?: "sm" | "md"
}

/** A key cap. */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(function Kbd({ children, pressed = false, size = "md", className, ...props }, ref) {
  return (
    <kbd
      ref={ref}
      {...props}
      data-slot="kbd"
      data-size={size}
      data-pressed={pressed || undefined}
      className={cn(
        "inline-grid min-w-6.5 place-items-center rounded-lg border border-border border-b-2 bg-card px-1.5 pb-px text-xs font-medium text-foreground tabular-nums",
        "h-6.5 transition-transform data-[pressed]:translate-y-px data-[pressed]:border-b data-[pressed]:border-ring data-[pressed]:bg-accent data-[pressed]:text-accent-foreground",
        "data-[size=sm]:h-5.5 data-[size=sm]:min-w-5.5 data-[size=sm]:rounded-md data-[size=sm]:px-1 data-[size=sm]:text-[11px]",
        "data-[tone=warning]:border-destructive/60 data-[tone=warning]:bg-destructive/10",
        className,
      )}
    >
      {children}
    </kbd>
  )
})

export interface ShortcutKeysProps {
  shortcut: string
  platform?: Platform
  pressed?: ReadonlySet<string>
  size?: "sm" | "md"
  className?: string
}

/** A shortcut as key caps, with a spoken label. */
export function ShortcutKeys({ shortcut, platform: platformProp, pressed, size = "md", className }: ShortcutKeysProps) {
  const platform = usePlatform(platformProp)
  const tokens = shortcutTokens(shortcut, platform)
  return (
    <span data-slot="shortcut-keys" className={cn("inline-flex shrink-0 items-center gap-1", className)} role="img" aria-label={tokens.map((token) => token.spoken).join(" ")}>
      {tokens.map((token, index) => (
        <Kbd key={`${index}-${token.id}`} size={size} pressed={pressed?.has(token.id)} aria-hidden="true">
          {token.label}
        </Kbd>
      ))}
    </span>
  )
}

export interface ShortcutBinding {
  shortcut: string
  label: string
}

export type ShortcutRecorderClassNames = {
  root?: string
  label?: string
  control?: string
  message?: string
}

export interface ShortcutRecorderProps {
  label: string
  hideLabel?: boolean
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null, details: { replaced?: ShortcutBinding }) => void
  resetValue?: string | null
  bindings?: ShortcutBinding[]
  warnReserved?: boolean
  requireModifier?: boolean
  platform?: Platform
  placeholder?: string
  description?: string
  disabled?: boolean
  id?: string
  className?: string
  classNames?: ShortcutRecorderClassNames
}

const RESERVED: ShortcutBinding[] = [
  { shortcut: "mod+w", label: "Close tab" },
  { shortcut: "mod+t", label: "New tab" },
  { shortcut: "mod+n", label: "New window" },
  { shortcut: "mod+q", label: "Quit" },
  { shortcut: "mod+l", label: "Address bar" },
  { shortcut: "mod+r", label: "Reload" },
  { shortcut: "mod+shift+t", label: "Reopen tab" },
  { shortcut: "mod+c", label: "Copy" },
  { shortcut: "mod+v", label: "Paste" },
  { shortcut: "mod+x", label: "Cut" },
  { shortcut: "mod+z", label: "Undo" },
  { shortcut: "mod+a", label: "Select all" },
]

type Pending = { shortcut: string; conflict: ShortcutBinding; reserved: boolean }

const chip: Variants = {
  enter: { opacity: 0, scale: 0.72, y: 4, filter: `blur(${motionPresets.blur.subtle}px)` },
  rest: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      ...motionPresets.spring.snappy,
      delay: index * motionPresets.stagger.item,
      opacity: { duration: 0.14, delay: index * motionPresets.stagger.item },
      filter: { duration: 0.16, delay: index * motionPresets.stagger.item },
    },
  }),
  exit: { opacity: 0, scale: 0.8, filter: `blur(${motionPresets.blur.subtle}px)`, transition: { duration: 0.1 } },
}
const chipFade: Variants = {
  enter: { opacity: 0 },
  rest: { opacity: 1, scale: 1, y: 0, filter: "none", transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.06 } },
}

/**
 * A field that records a keyboard shortcut. A combination that is already taken asks before it is used.
 */
export function ShortcutRecorder({
  label,
  hideLabel = false,
  value,
  defaultValue = null,
  onValueChange,
  resetValue,
  bindings = [],
  warnReserved = true,
  requireModifier = true,
  platform: platformProp,
  placeholder = "Record shortcut",
  description,
  disabled = false,
  id,
  className,
  classNames,
}: ShortcutRecorderProps) {
  const reduced = useReducedFlag()
  const platform = usePlatform(platformProp)
  const uid = React.useId()
  const buttonId = id ?? `${uid}-button`
  const labelId = `${uid}-label`
  const messageId = `${uid}-message`

  const [inner, setInner] = React.useState<string | null>(defaultValue)
  const current = value !== undefined ? value : inner
  const restoreTo = resetValue !== undefined ? resetValue : defaultValue

  const [recording, setRecording] = React.useState(false)
  const [live, setLive] = React.useState<string[]>([])
  const [pending, setPending] = React.useState<Pending | null>(null)
  const [nudge, setNudge] = React.useState<string | null>(null)
  const [settled, setSettled] = React.useState(0)
  const [announcement, setAnnouncement] = React.useState("")
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  const spoken = (shortcut: string | null) => (shortcut ? formatShortcut(shortcut, platform).spoken : "none")

  const commit = React.useCallback(
    (next: string | null, replaced?: ShortcutBinding) => {
      setPending(null)
      setNudge(null)
      if (value === undefined) setInner(next)
      onValueChange?.(next, { replaced })
      setSettled((count) => count + 1)
      setAnnouncement(next ? `Shortcut set to ${formatShortcut(next, platform).spoken}` : "Shortcut cleared")
    },
    [onValueChange, platform, value],
  )

  const start = () => {
    if (disabled) return
    setPending(null)
    setNudge(null)
    setLive([])
    setRecording(true)
    setAnnouncement("Recording. Press the new shortcut, or Escape to cancel.")
  }
  const stop = () => {
    setRecording(false)
    setLive([])
  }

  const conflictFor = (shortcut: string): Pending | null => {
    const normal = normalizeShortcut(shortcut, platform)
    if (current && normalizeShortcut(current, platform) === normal) return null
    const taken = bindings.find((binding) => normalizeShortcut(binding.shortcut, platform) === normal)
    if (taken) return { shortcut, conflict: taken, reserved: false }
    const reserved = warnReserved ? RESERVED.find((binding) => normalizeShortcut(binding.shortcut, platform) === normal) : undefined
    return reserved ? { shortcut, conflict: reserved, reserved: true } : null
  }

  const liveMods = (event: React.KeyboardEvent) => {
    const mods: string[] = []
    if (event.ctrlKey && platform === "mac") mods.push("ctrl")
    if (event.altKey) mods.push("alt")
    if (event.shiftKey) mods.push("shift")
    if (platform === "mac" ? event.metaKey : event.ctrlKey) mods.push("mod")
    if (platform === "other" && event.metaKey) mods.push("meta")
    return mods
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!recording) {
      if ((event.key === "Backspace" || event.key === "Delete") && current) {
        event.preventDefault()
        commit(null)
      }
      return
    }
    if (event.key === "Tab" && !event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
      stop()
      return
    }
    event.preventDefault()
    const bare = !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey
    if (bare && event.key === "Escape") {
      stop()
      setAnnouncement("Recording canceled")
      return
    }
    if (bare && (event.key === "Backspace" || event.key === "Delete")) {
      stop()
      commit(null)
      return
    }
    const shortcut = shortcutFromEvent(event.nativeEvent, platform)
    if (!shortcut) {
      setLive(liveMods(event))
      return
    }
    const { mods, key } = splitShortcut(shortcut)
    const strong = mods.has("mod") || mods.has("ctrl") || mods.has("alt") || mods.has("meta")
    if (requireModifier && !strong && !/^f\d+$/.test(key)) {
      const hint = platform === "mac" ? "Include ⌘, ⌃, or ⌥" : "Include Ctrl or Alt"
      setNudge(hint)
      setAnnouncement(hint)
      setLive(liveMods(event))
      return
    }
    stop()
    const conflict = conflictFor(shortcut)
    if (conflict) {
      setPending(conflict)
      setAnnouncement(`${formatShortcut(shortcut, platform).spoken} is ${conflict.reserved ? "reserved for" : "used by"} ${conflict.conflict.label}. Use anyway, or record another.`)
      return
    }
    commit(shortcut)
  }
  function onKeyUp(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (recording) setLive(liveMods(event))
  }

  const shown = pending?.shortcut ?? current
  const tokens = recording ? shortcutTokens(live.join("+"), platform) : shown ? shortcutTokens(shown, platform) : []
  const state = recording ? "recording" : pending ? "conflict" : "idle"
  const canReset = !recording && (pending !== null || (current ?? null) !== (restoreTo ?? null))
  const canClear = !recording && !!current && !pending
  const message = pending
    ? {
        tone: "warning" as const,
        key: `c-${pending.shortcut}`,
        body: (
          <>
            {pending.reserved ? "Reserved for" : "Already used by"} <strong className="font-medium text-foreground">{pending.conflict.label}</strong>
          </>
        ),
      }
    : nudge
      ? { tone: "hint" as const, key: `n-${nudge}`, body: <>{nudge}</> }
      : recording
        ? { tone: "hint" as const, key: "rec", body: <>Esc to cancel, Backspace to clear</> }
        : description
          ? { tone: "hint" as const, key: "d", body: <>{description}</> }
          : null

  React.useEffect(() => {
    if (!settled) return
    const timer = window.setTimeout(() => setSettled(0), 700)
    return () => window.clearTimeout(timer)
  }, [settled])

  return (
    <div data-slot="shortcut-recorder" className={cn("grid min-w-0", disabled && "opacity-50", className, classNames?.root)} data-disabled={disabled || undefined}>
      <span id={labelId} data-slot="shortcut-recorder-label" className={cn(hideLabel ? "sr-only" : "mb-2 justify-self-start text-sm font-medium", classNames?.label)}>
        {label}
      </span>
      <div
        data-slot="shortcut-recorder-control"
        data-state={state}
        className={cn(
          "flex h-9 min-w-0 items-center rounded-lg border border-input bg-background",
          "has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
          state === "recording" && "border-ring bg-accent/40",
          state === "conflict" && "border-destructive",
          classNames?.control,
        )}
      >
        <button
          ref={buttonRef}
          id={buttonId}
          type="button"
          className="flex h-full min-w-0 flex-1 items-center rounded-lg bg-transparent px-2 text-left outline-none"
          disabled={disabled}
          aria-labelledby={`${labelId} ${buttonId}`}
          aria-describedby={message ? messageId : undefined}
          aria-pressed={recording}
          onClick={(event) => {
            if (recording) {
              if (event.detail !== 0) {
                stop()
                setAnnouncement("Recording canceled")
              }
              return
            }
            start()
          }}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onBlur={() => {
            if (recording) {
              stop()
              setNudge(null)
            }
          }}
        >
          <span className="sr-only">{recording ? "Recording" : shown ? spoken(shown) : placeholder}</span>
          <span className="relative flex min-w-0 items-center gap-1" aria-hidden="true">
            {recording ? <span className={cn("mr-1 ml-0.5 size-1.5 shrink-0 rounded-full bg-primary", reduced ? "" : "animate-pulse")} /> : null}
            <AnimatePresence initial={false} mode="popLayout">
              {tokens.map((token, index) => (
                <motion.span
                  key={`${token.id}`}
                  layout={reduced ? false : "position"}
                  custom={recording ? 0 : index}
                  variants={reduced ? chipFade : chip}
                  initial="enter"
                  animate="rest"
                  exit="exit"
                  transition={reduced ? { duration: 0 } : { layout: motionPresets.spring.snappy }}
                  className="inline-flex"
                >
                  <Kbd pressed={recording || (settled > 0 && !pending)} data-tone={pending ? "warning" : undefined}>
                    {token.label}
                  </Kbd>
                </motion.span>
              ))}
              {tokens.length === 0 ? (
                <motion.span
                  key={recording ? "prompt" : "placeholder"}
                  className={cn("pl-0.5 text-sm whitespace-nowrap", recording ? "text-foreground" : "text-muted-foreground")}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4, filter: `blur(${motionPresets.blur.subtle}px)` }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  transition={reduced ? { duration: 0.1 } : { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.enter] }}
                >
                  {recording ? "Press keys" : placeholder}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </span>
        </button>

        <span className="flex shrink-0 items-center gap-0.5 pr-1">
          <AnimatePresence initial={false}>
            {canReset ? (
              <motion.span key="reset" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.1 } }} transition={reduced ? { duration: 0 } : motionPresets.spring.snappy}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Reset to ${restoreTo ? formatShortcut(restoreTo, platform).spoken : "none"}`}
                  onClick={() => {
                    commit(restoreTo ?? null)
                    buttonRef.current?.focus()
                  }}
                >
                  <RotateCcw aria-hidden="true" />
                </Button>
              </motion.span>
            ) : null}
            {canClear ? (
              <motion.span key="clear" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.1 } }} transition={reduced ? { duration: 0 } : motionPresets.spring.snappy}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Clear shortcut"
                  onClick={() => {
                    commit(null)
                    buttonRef.current?.focus()
                  }}
                >
                  <X aria-hidden="true" />
                </Button>
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      </div>

      <AnimatePresence initial={false}>
        {message ? (
          <motion.div
            key="slot"
            className="overflow-hidden"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, transition: reduced ? { duration: 0 } : { height: motionPresets.spring.smooth, opacity: { duration: 0.1 } } }}
            transition={reduced ? { duration: 0 } : { height: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.fast } }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={message.key}
                id={messageId}
                data-tone={message.tone}
                className={cn(
                  "flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 pt-2 text-xs",
                  message.tone === "warning" ? "text-foreground" : "text-muted-foreground",
                  classNames?.message,
                )}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: `blur(${motionPresets.blur.soft}px)` }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
                transition={{ duration: reduced ? 0.1 : motionPresets.duration.standard, ease: [...motionPresets.ease.enter] }}
              >
                <span className={cn(message.tone === "warning" && "before:mr-1.5 before:inline-block before:size-1.5 before:rounded-full before:bg-destructive before:align-middle")}>
                  {message.body}
                </span>
                {pending ? (
                  <span className="inline-flex gap-3">
                    <button
                      type="button"
                      className="font-medium text-foreground underline decoration-border underline-offset-3"
                      onClick={() => {
                        const taken = pending
                        commit(taken.shortcut, taken.reserved ? undefined : taken.conflict)
                        buttonRef.current?.focus()
                      }}
                    >
                      Use anyway
                    </button>
                    <button
                      type="button"
                      className="text-muted-foreground"
                      onClick={() => {
                        setPending(null)
                        setAnnouncement("Kept the previous shortcut")
                        buttonRef.current?.focus()
                      }}
                    >
                      Cancel
                    </button>
                  </span>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </div>
  )
}

export interface ShortcutListItem {
  label: string
  shortcut: string
  keywords?: string
}
export interface ShortcutListGroup {
  label: string
  items: ShortcutListItem[]
}

export type ShortcutListClassNames = {
  root?: string
  search?: string
  row?: string
}

export interface ShortcutListProps {
  groups: ShortcutListGroup[]
  label?: string
  searchable?: boolean
  searchPlaceholder?: string
  highlightPressed?: boolean
  platform?: Platform
  className?: string
  classNames?: ShortcutListClassNames
}

/**
 * A searchable, grouped cheatsheet. Holding a modifier lights that cap and fades rows that do not use it.
 */
export function ShortcutList({
  groups,
  label = "Keyboard shortcuts",
  searchable = true,
  searchPlaceholder = "Search shortcuts",
  highlightPressed = true,
  platform: platformProp,
  className,
  classNames,
}: ShortcutListProps) {
  const reduced = useReducedFlag()
  const platform = usePlatform(platformProp)
  const held = usePressedKeys(highlightPressed)
  const [query, setQuery] = React.useState("")
  const searchRef = React.useRef<HTMLInputElement>(null)

  const heldMods = React.useMemo(() => [...held].filter((key) => ["meta", "ctrl", "alt", "shift"].includes(key)), [held])
  const words = query
    .trim()
    .toLowerCase()
    .replace(/[⌘]/g, " cmd ")
    .replace(/[⇧]/g, " shift ")
    .replace(/[⌥]/g, " alt ")
    .replace(/[⌃]/g, " ctrl ")
    .split(/[\s+]+/)
    .filter(Boolean)
  const aliases: Record<string, string> = {
    cmd: "command",
    command: "command",
    ctrl: "control",
    control: "control",
    opt: "option",
    option: platform === "mac" ? "option" : "alt",
    alt: platform === "mac" ? "option" : "alt",
    win: "windows",
    esc: "escape",
    return: platform === "mac" ? "return" : "enter",
  }

  const filtered = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!words.length) return true
        const tokens = shortcutTokens(item.shortcut, platform)
        const haystack = `${item.label} ${group.label} ${item.keywords ?? ""} ${tokens.map((token) => `${token.spoken} ${token.label}`).join(" ")}`.toLowerCase()
        return words.every((word) => haystack.includes(aliases[word] ?? word) || haystack.includes(word))
      }),
    }))
    .filter((group) => group.items.length)

  const total = filtered.reduce((sum, group) => sum + group.items.length, 0)
  const rowTransition = reduced ? { duration: 0 } : motionPresets.spring.smooth

  return (
    <section data-slot="shortcut-list" className={cn("@container grid min-w-0 gap-3", className, classNames?.root)} aria-label={label}>
      {searchable ? (
        <div className={cn("flex h-8 items-center gap-2 rounded-lg border border-input bg-background pr-1 pl-2.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50", classNames?.search)}>
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <Input
            ref={searchRef}
            type="search"
            placeholder={searchPlaceholder}
            value={query}
            aria-label={searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="h-full border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent [&::-webkit-search-cancel-button]:appearance-none"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.preventDefault()
                setQuery("")
              }
            }}
          />
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums" aria-live="polite">
            {query ? `${total} ${total === 1 ? "match" : "matches"}` : ""}
          </span>
          <AnimatePresence initial={false}>
            {query ? (
              <motion.span key="clear" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.1 } }} transition={reduced ? { duration: 0 } : motionPresets.spring.snappy}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("")
                    searchRef.current?.focus()
                  }}
                >
                  <X aria-hidden="true" />
                </Button>
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}

      <div className="grid items-start gap-x-6 @min-[520px]:grid-cols-2">
        <AnimatePresence initial={false}>
          {filtered.map((group) => (
            <motion.section
              key={group.label}
              className="overflow-hidden"
              aria-label={group.label}
              initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={rowTransition}
            >
              <h4 className="m-0 py-2 text-xs font-normal text-muted-foreground">{group.label}</h4>
              <ul className="m-0 grid list-none p-0">
                <AnimatePresence initial={false}>
                  {group.items.map((item) => {
                    const tokens = shortcutTokens(item.shortcut, platform)
                    const ids = tokens.map((token) => token.id)
                    const match = held.size > 0 && ids.every((key) => held.has(key))
                    const dim = heldMods.length > 0 && !match && !heldMods.every((mod) => ids.includes(mod))
                    return (
                      <motion.li
                        key={item.label}
                        data-match={match || undefined}
                        data-dim={dim || undefined}
                        className={cn("group/row overflow-hidden data-[dim]:opacity-40", classNames?.row)}
                        initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        transition={rowTransition}
                      >
                        <span className="flex min-h-9 items-center justify-between gap-3 rounded-lg px-2 group-data-[match]/row:bg-accent">
                          <span className="min-w-0 truncate text-sm text-muted-foreground group-data-[match]/row:text-foreground">
                            {item.label}
                          </span>
                          <ShortcutKeys shortcut={item.shortcut} platform={platform} pressed={held} size="sm" />
                        </span>
                      </motion.li>
                    )
                  })}
                </AnimatePresence>
              </ul>
            </motion.section>
          ))}
        </AnimatePresence>
        {total === 0 ? <p className="m-0 py-4 text-sm text-muted-foreground">No shortcuts match “{query.trim()}”</p> : null}
      </div>
    </section>
  )
}
