"use client"

// Format switch, copy, popover mode, disabled eyedropper with a reason and saved-color
// management are a clean-room build inspired by the shadcn/studio color picker docs
// (idea, layout and interaction only; MIT + Commons Clause, no code or assets copied).
// Saved swatches and the EyeDropper hook stay adapted from Arc UI (MIT). See NOTICE.

import * as React from "react"

import { ArrowLeft, ArrowRight, Check, Copy, Pipette, Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type HsvaColor = {
  h: number
  s: number
  v: number
  a: number
}

export type ColorFormat = "hex" | "rgb" | "hsl"

export const colorFormats: readonly ColorFormat[] = ["hex", "rgb", "hsl"]

const HASH = "#"
const HUE_SPACE = "hsl"
const RGB_SPACE = "rgb"
const MAX_INPUT = 64
const COPY_RESET_MS = 1500

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function hsvaToRgb(color: HsvaColor) {
  const h = ((color.h % 360) + 360) % 360
  const s = clamp(color.s, 0, 1)
  const v = clamp(color.v, 0, 1)
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) {
    r = c
    g = x
  } else if (h < 120) {
    r = x
    g = c
  } else if (h < 180) {
    g = c
    b = x
  } else if (h < 240) {
    g = x
    b = c
  } else if (h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

function channel(value: number) {
  return value.toString(16).padStart(2, "0")
}

export function hsvaToHex(color: HsvaColor) {
  const { r, g, b } = hsvaToRgb(color)
  return `${channel(r)}${channel(g)}${channel(b)}`
}

export function hsvaToCss(color: HsvaColor) {
  const { r, g, b } = hsvaToRgb(color)
  return `${RGB_SPACE}(${r} ${g} ${b} / ${clamp(color.a, 0, 1)})`
}

function hueCss(hue: number) {
  return `${HUE_SPACE}(${hue} 100% 50%)`
}

function grayCss(lightness: number) {
  return `${HUE_SPACE}(0 0% ${lightness}%)`
}

function rgbToHsva(r: number, g: number, b: number, a = 1): HsvaColor {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  let h = 0
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6
    else if (max === gn) h = (bn - rn) / delta + 2
    else h = (rn - gn) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max, a }
}

function hslToHsva(h: number, s: number, l: number, a = 1): HsvaColor {
  const v = l + s * Math.min(l, 1 - l)
  return { h: ((h % 360) + 360) % 360, s: v === 0 ? 0 : 2 * (1 - l / v), v, a }
}

function hsvaToHsl(color: HsvaColor) {
  const s = clamp(color.s, 0, 1)
  const v = clamp(color.v, 0, 1)
  const l = v * (1 - s / 2)
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l)
  return { h: ((color.h % 360) + 360) % 360, s: sl, l }
}

export function hexToHsva(input: string): HsvaColor | null {
  const raw = input.trim().replace(/^#/, "")
  const full = raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw
  if (!/^[\da-fA-F]{6}$/.test(full)) return null
  return rgbToHsva(
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  )
}

export type ParsedColor = {
  color: HsvaColor
  format: ColorFormat
  /** True when the text carried its own alpha. Otherwise keep the current alpha. */
  hasAlpha: boolean
}

const NUMBER = String.raw`[+-]?(?:\d+\.?\d*|\.\d+)`

function readNumber(token: string, { max, percentMax }: { max: number; percentMax: number }) {
  const percent = token.endsWith("%")
  const text = percent ? token.slice(0, -1) : token
  if (!new RegExp(`^${NUMBER}$`).test(text)) return null
  const value = Number(text)
  if (!Number.isFinite(value)) return null
  const scaled = percent ? (value / 100) * percentMax : value
  if (scaled < 0 || scaled > (percent ? percentMax : max)) return null
  return scaled
}

function readAlpha(token: string | undefined) {
  if (token == null) return { alpha: 1, hasAlpha: false }
  const alpha = readNumber(token, { max: 1, percentMax: 1 })
  return alpha == null ? null : { alpha, hasAlpha: true }
}

/** Splits "a b c / d" or "a, b, c, d" into channel tokens. Mixed separators are rejected. */
function splitChannels(body: string) {
  const text = body.trim()
  if (!text) return null
  if (text.includes(",")) {
    if (text.includes("/")) return null
    const parts = text.split(",").map((part) => part.trim())
    if (parts.some((part) => !part || /\s/.test(part))) return null
    return parts
  }
  const [main, alpha, extra] = text.split("/")
  if (extra !== undefined || main === undefined) return null
  const parts = main.trim().split(/\s+/)
  if (alpha !== undefined) {
    const a = alpha.trim()
    if (!a || /\s/.test(a)) return null
    parts.push(a)
  }
  return parts
}

function parseRgbChannels(parts: string[]): ParsedColor | null {
  if (parts.length !== 3 && parts.length !== 4) return null
  const rgb = parts.slice(0, 3).map((part) => readNumber(part, { max: 255, percentMax: 255 }))
  if (rgb.some((value) => value == null)) return null
  const alpha = readAlpha(parts[3])
  if (!alpha) return null
  const [r, g, b] = rgb as number[]
  return { color: rgbToHsva(r!, g!, b!, alpha.alpha), format: "rgb", hasAlpha: alpha.hasAlpha }
}

function parseHslChannels(parts: string[]): ParsedColor | null {
  if (parts.length !== 3 && parts.length !== 4) return null
  const hueText = parts[0]!.replace(/deg$/, "")
  if (!new RegExp(`^${NUMBER}$`).test(hueText)) return null
  const hue = Number(hueText)
  if (!Number.isFinite(hue)) return null
  const s = parts[1]!.endsWith("%") ? readNumber(parts[1]!, { max: 1, percentMax: 1 }) : null
  const l = parts[2]!.endsWith("%") ? readNumber(parts[2]!, { max: 1, percentMax: 1 }) : null
  if (s == null || l == null) return null
  const alpha = readAlpha(parts[3])
  if (!alpha) return null
  return { color: hslToHsva(hue, s, l, alpha.alpha), format: "hsl", hasAlpha: alpha.hasAlpha }
}

function parseHex(text: string): ParsedColor | null {
  const raw = text.replace(/^#/, "")
  if (!/^(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/.test(raw)) return null
  const full = raw.length <= 4 ? raw.split("").map((char) => char + char).join("") : raw
  const hasAlpha = full.length === 8
  const alpha = hasAlpha ? Number.parseInt(full.slice(6, 8), 16) / 255 : 1
  const color = rgbToHsva(
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
    alpha,
  )
  return { color, format: "hex", hasAlpha }
}

/**
 * Reads hex (3, 4, 6 or 8 digits, with or without the hash), the rgb and hsl
 * functions with commas or spaces and an optional alpha, and bare channel
 * lists when `hint` says which space they are in. Returns null for anything
 * out of range or malformed, so nothing invalid reaches the color state.
 */
export function parseColor(input: string, hint?: ColorFormat): ParsedColor | null {
  if (typeof input !== "string" || input.length > MAX_INPUT) return null
  const text = input.trim().toLowerCase()
  if (!text) return null
  const fn = /^(rgba?|hsla?)\s*\((.*)\)$/.exec(text)
  if (fn) {
    const parts = splitChannels(fn[2]!)
    if (!parts) return null
    return fn[1]!.startsWith("rgb") ? parseRgbChannels(parts) : parseHslChannels(parts)
  }
  const hex = parseHex(text)
  if (hex) return hex
  if (hint === "rgb" || hint === "hsl") {
    const parts = splitChannels(text)
    if (!parts) return null
    return hint === "rgb" ? parseRgbChannels(parts) : parseHslChannels(parts)
  }
  return null
}

/** Prints a color the way the input shows it. Hex stays six digits; alpha lives on its own slider. */
export function formatColor(color: HsvaColor, format: ColorFormat) {
  const alpha = round(clamp(color.a, 0, 1), 2)
  const tail = alpha < 1 ? ` / ${alpha}` : ""
  if (format === "rgb") {
    const { r, g, b } = hsvaToRgb(color)
    return `${RGB_SPACE}(${r} ${g} ${b}${tail})`
  }
  if (format === "hsl") {
    const { h, s, l } = hsvaToHsl(color)
    return `${HUE_SPACE}(${Math.round(h) % 360} ${Math.round(s * 100)}% ${Math.round(l * 100)}%${tail})`
  }
  return `${HASH}${hsvaToHex(color)}`
}

/** Keeps a pasted paragraph from flooding the error line. */
function quote(text: string, max = 28) {
  const clean = text.trim().replace(/\s+/g, " ")
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean
}

function sameColor(a: HsvaColor, b: HsvaColor) {
  return hsvaToHex(a) === hsvaToHex(b) && round(a.a, 2) === round(b.a, 2)
}

export type ColorPickerLabels = {
  saturation: string
  hue: string
  alpha: string
  format: string
  hex: string
  rgb: string
  hsl: string
  invalid: (text: string) => string
  copy: string
  copied: (value: string) => string
  copyFailed: string
  eyedropper: string
  eyedropperUnsupported: string
  saved: string
  savedEmpty: string
  save: string
  saveFull: (max: number) => string
  alreadySaved: (index: number) => string
  savedAnnounce: (value: string) => string
  swatch: (index: number, value: string) => string
  moveEarlier: (index: number | null) => string
  moveLater: (index: number | null) => string
  remove: (index: number | null) => string
  moved: (from: number, to: number) => string
  removed: (value: string) => string
  trigger: (value: string) => string
}

export const colorPickerLabelsEn: ColorPickerLabels = {
  saturation: "Saturation and brightness",
  hue: "Hue",
  alpha: "Alpha",
  format: "Color format",
  hex: "Hex",
  rgb: "RGB",
  hsl: "HSL",
  invalid: (text) => `“${text}” is not a color. Use #RRGGBB, rgb 0-255 or hsl with percentages.`,
  copy: "Copy value",
  copied: (value) => `Copied ${value}`,
  copyFailed: "Could not copy. Select the value and copy it by hand.",
  eyedropper: "Pick a color from the screen",
  eyedropperUnsupported: "This browser cannot pick colors from the screen. Use Chrome or Edge on a computer, or type the value.",
  saved: "Saved colors",
  savedEmpty: "No saved colors yet. Save the current one to reuse it.",
  save: "Save color",
  saveFull: (max) => `You can save up to ${max} colors. Remove one to save another.`,
  alreadySaved: (index) => `Already saved as color ${index}.`,
  savedAnnounce: (value) => `Saved ${value}.`,
  swatch: (index, value) => `Saved color ${index}, ${value}`,
  moveEarlier: (index) => (index == null ? "Move the selected color earlier" : `Move color ${index} earlier`),
  moveLater: (index) => (index == null ? "Move the selected color later" : `Move color ${index} later`),
  remove: (index) => (index == null ? "Remove the selected color" : `Remove color ${index}`),
  moved: (from, to) => `Moved color ${from} to position ${to}.`,
  removed: (value) => `Removed ${value}.`,
  trigger: (value) => `Choose a color, current ${value}`,
}

export const colorPickerLabelsEs: ColorPickerLabels = {
  saturation: "Saturación y brillo",
  hue: "Tono",
  alpha: "Alfa",
  format: "Formato de color",
  hex: "Hex",
  rgb: "RGB",
  hsl: "HSL",
  invalid: (text) => `“${text}” no es un color. Usa #RRGGBB, rgb de 0 a 255 o hsl con porcentajes.`,
  copy: "Copiar valor",
  copied: (value) => `Copiado ${value}`,
  copyFailed: "No se pudo copiar. Selecciona el valor y cópialo a mano.",
  eyedropper: "Tomar un color de la pantalla",
  eyedropperUnsupported: "Este navegador no puede tomar colores de la pantalla. Usa Chrome o Edge en computadora, o escribe el valor.",
  saved: "Colores guardados",
  savedEmpty: "Todavía no guardas colores. Guarda el actual para reusarlo.",
  save: "Guardar color",
  saveFull: (max) => `Puedes guardar hasta ${max} colores. Quita uno para guardar otro.`,
  alreadySaved: (index) => `Ya está guardado como color ${index}.`,
  savedAnnounce: (value) => `Guardado ${value}.`,
  swatch: (index, value) => `Color guardado ${index}, ${value}`,
  moveEarlier: (index) => (index == null ? "Mover el color elegido antes" : `Mover el color ${index} antes`),
  moveLater: (index) => (index == null ? "Mover el color elegido después" : `Mover el color ${index} después`),
  remove: (index) => (index == null ? "Quitar el color elegido" : `Quitar el color ${index}`),
  moved: (from, to) => `El color ${from} pasó a la posición ${to}.`,
  removed: (value) => `Se quitó ${value}.`,
  trigger: (value) => `Elegir color, actual ${value}`,
}

export type EyedropperMode = "auto" | "unsupported" | "hide-unsupported" | "hidden"

export type ColorPickerProps = {
  value?: HsvaColor
  defaultValue?: HsvaColor
  /** Fires on every change, including each pointer move while dragging. */
  onValueChange?: (value: HsvaColor) => void
  /** Fires once when a gesture ends: pointer up, key up, a committed text value, a swatch or the eyedropper. */
  onValueCommit?: (value: HsvaColor) => void
  format?: ColorFormat
  defaultFormat?: ColorFormat
  onFormatChange?: (format: ColorFormat) => void
  /** Formats offered by the switch. One format hides the switch. */
  formats?: readonly ColorFormat[]
  labels?: Partial<ColorPickerLabels>
  hueLabel?: string
  alphaLabel?: string
  hexLabel?: string
  saturationLabel?: string
  /** Saved colors. Selecting one commits that value. */
  swatches?: readonly HsvaColor[]
  defaultSwatches?: readonly HsvaColor[]
  /** Turns on save, remove and reorder for saved colors. */
  onSwatchesChange?: (swatches: HsvaColor[]) => void
  maxSwatches?: number
  onSwatchSelect?: (value: HsvaColor) => void
  onCopy?: (value: string) => void
  /**
   * `auto` shows the button and disables it with a reason when the browser has no EyeDropper API.
   * `unsupported` forces that disabled state, for a host that knows the API is blocked.
   * `hide-unsupported` keeps the earlier behavior of hiding it. `hidden` never shows it.
   */
  eyedropper?: EyedropperMode
  eyedropperLabel?: string
  className?: string
}

const DEFAULT_COLOR: HsvaColor = { h: 222, s: 0.72, v: 0.78, a: 1 }
const DEFAULT_MAX_SWATCHES = 12

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> }

function subscribeNever() {
  return () => {}
}

function readEyedropperSupport() {
  return typeof window !== "undefined" && "EyeDropper" in window
}

/** null while the server render hydrates, so the markup matches before the browser is known. */
function useEyedropperSupport(): boolean | null {
  return React.useSyncExternalStore(subscribeNever, readEyedropperSupport, () => null)
}

function useControllable<T>(value: T | undefined, defaultValue: T) {
  const [inner, setInner] = React.useState(defaultValue)
  const controlled = value !== undefined
  return [controlled ? value : inner, (next: T) => (controlled ? undefined : setInner(next))] as const
}

function moveItem<T>(list: readonly T[], from: number, to: number) {
  const next = list.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item as T)
  return next
}

export function ColorPicker({
  value,
  defaultValue = DEFAULT_COLOR,
  onValueChange,
  onValueCommit,
  format: formatProp,
  defaultFormat = "hex",
  onFormatChange,
  formats = colorFormats,
  labels: labelsProp,
  hueLabel,
  alphaLabel,
  hexLabel,
  saturationLabel,
  swatches,
  defaultSwatches,
  onSwatchesChange,
  maxSwatches = DEFAULT_MAX_SWATCHES,
  onSwatchSelect,
  onCopy,
  eyedropper = "auto",
  eyedropperLabel,
  className,
}: ColorPickerProps) {
  const labels: ColorPickerLabels = { ...colorPickerLabelsEn, ...labelsProp }
  const text = {
    saturation: saturationLabel ?? labels.saturation,
    hue: hueLabel ?? labels.hue,
    alpha: alphaLabel ?? labels.alpha,
    hex: hexLabel ?? labels.hex,
    eyedropper: eyedropperLabel ?? labels.eyedropper,
  }

  const [color, setColor] = useControllable(value, defaultValue)
  const [format, setFormat] = useControllable<ColorFormat>(formatProp, defaultFormat)
  const [saved, setSaved] = useControllable<readonly HsvaColor[]>(swatches, defaultSwatches ?? [])
  const editable = onSwatchesChange !== undefined || defaultSwatches !== undefined
  const offered = formats.length ? formats : colorFormats
  const activeFormat = offered.includes(format) ? format : offered[0]!

  const [draft, setDraft] = React.useState<string | null>(null)
  const [invalid, setInvalid] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [announcement, setAnnouncement] = React.useState("")
  const [hint, setHint] = React.useState<"eyedropper" | "full" | null>(null)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const [dragIndex, setDragIndex] = React.useState<number | null>(null)

  const latest = React.useRef(color)
  const surfaceMoved = React.useRef(false)
  const copyTimer = React.useRef(0)
  const swatchRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const focusAfter = React.useRef<number | null>(null)
  const saveRef = React.useRef<HTMLButtonElement>(null)

  const id = React.useId()
  const inputId = `${id}-value`
  const errorId = `${id}-error`
  const eyedropperHintId = `${id}-eyedropper`
  const fullHintId = `${id}-full`
  const savedId = `${id}-saved`

  const support = useEyedropperSupport()
  const eyedropperAvailable = eyedropper !== "unsupported" && support === true
  const showEyedropper =
    eyedropper === "auto" || eyedropper === "unsupported" || (eyedropper === "hide-unsupported" && support === true)

  React.useEffect(() => {
    latest.current = color
  }, [color])

  React.useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  React.useEffect(() => {
    if (focusAfter.current == null) return
    const index = Math.min(focusAfter.current, saved.length - 1)
    focusAfter.current = null
    if (index >= 0) swatchRefs.current[index]?.focus()
    else saveRef.current?.focus()
  }, [saved])

  const shown = formatColor(color, activeFormat)
  const inputLabel = activeFormat === "hex" ? text.hex : labels[activeFormat]
  const full = saved.length >= maxSwatches

  function change(next: HsvaColor) {
    latest.current = next
    setColor(next)
    onValueChange?.(next)
  }

  function commitEnd(next: HsvaColor = latest.current) {
    onValueCommit?.(next)
  }

  function commit(next: HsvaColor) {
    change(next)
    commitEnd(next)
  }

  function announce(message: string) {
    setAnnouncement(message)
  }

  function updateSaved(next: HsvaColor[]) {
    setSaved(next)
    onSwatchesChange?.(next)
  }

  function moveSurface(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const s = clamp((event.clientX - rect.left) / rect.width, 0, 1)
    const v = clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1)
    change({ ...latest.current, s, v })
  }

  function onSurfaceKey(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 0.1 : 0.02
    const current = latest.current
    if (event.key === "ArrowLeft") change({ ...current, s: clamp(current.s - step, 0, 1) })
    else if (event.key === "ArrowRight") change({ ...current, s: clamp(current.s + step, 0, 1) })
    else if (event.key === "ArrowDown") change({ ...current, v: clamp(current.v - step, 0, 1) })
    else if (event.key === "ArrowUp") change({ ...current, v: clamp(current.v + step, 0, 1) })
    else return
    event.preventDefault()
  }

  function onArrowKeyUp(event: React.KeyboardEvent) {
    if (/^(Arrow|Page|Home|End)/.test(event.key)) commitEnd()
  }

  function apply(textValue: string) {
    const parsed = parseColor(textValue, activeFormat)
    if (!parsed) {
      setDraft(textValue)
      setInvalid(true)
      announce(labels.invalid(quote(textValue)))
      return false
    }
    commit({ ...parsed.color, a: parsed.hasAlpha ? parsed.color.a : latest.current.a })
    setDraft(null)
    setInvalid(false)
    return true
  }

  function chooseFormat(next: ColorFormat) {
    setFormat(next)
    setDraft(null)
    setInvalid(false)
    onFormatChange?.(next)
  }

  async function copy() {
    const valueText = formatColor(latest.current, activeFormat)
    try {
      await navigator.clipboard.writeText(valueText)
    } catch {
      setCopied(false)
      announce(labels.copyFailed)
      return
    }
    onCopy?.(valueText)
    setCopied(true)
    announce(labels.copied(valueText))
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), COPY_RESET_MS)
  }

  function pickFromScreen() {
    if (!eyedropperAvailable) {
      // The reason is the button's description; showing it is enough, no second announcement.
      setHint("eyedropper")
      return
    }
    const Dropper = (globalThis as { EyeDropper?: EyeDropperCtor }).EyeDropper
    if (!Dropper) return
    void new Dropper()
      .open()
      .then((result) => {
        const parsed = parseColor(result.sRGBHex)
        if (parsed) commit({ ...parsed.color, a: latest.current.a })
      })
      .catch(() => {})
  }

  function saveCurrent() {
    if (full) {
      setHint("full")
      return
    }
    const current = latest.current
    const existing = saved.findIndex((swatch) => sameColor(swatch, current))
    if (existing >= 0) {
      setActiveIndex(existing)
      announce(labels.alreadySaved(existing + 1))
      return
    }
    updateSaved([...saved, current])
    setActiveIndex(saved.length)
    announce(labels.savedAnnounce(formatColor(current, activeFormat)))
  }

  /** `follow` moves focus with the color, for the keyboard shortcuts on the swatch itself. */
  function moveSwatch(from: number, to: number, follow = false) {
    if (to < 0 || to >= saved.length || from === to) return
    updateSaved(moveItem(saved, from, to))
    setActiveIndex(to)
    if (follow) focusAfter.current = to
    announce(labels.moved(from + 1, to + 1))
  }

  function removeSwatch(index: number, follow = false) {
    const removed = saved[index]
    if (!removed) return
    const next = saved.filter((_, position) => position !== index)
    updateSaved(next)
    setHint(null)
    const nextActive = next.length ? Math.min(index, next.length - 1) : null
    setActiveIndex(nextActive)
    // An empty list takes the toolbar with it, so focus goes to Save instead of the page.
    if (follow || nextActive == null) focusAfter.current = nextActive ?? -1
    announce(labels.removed(formatColor(removed, activeFormat)))
  }

  function onSwatchKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!editable) return
    if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowUp")) moveSwatch(index, index - 1, true)
    else if (event.altKey && (event.key === "ArrowRight" || event.key === "ArrowDown")) moveSwatch(index, index + 1, true)
    else if (event.key === "Delete" || event.key === "Backspace") removeSwatch(index, true)
    else return
    event.preventDefault()
  }

  const white = grayCss(100)
  const black = grayCss(0)
  const matching = saved.findIndex((swatch) => sameColor(swatch, color))
  const active = activeIndex != null && activeIndex < saved.length ? activeIndex : matching >= 0 ? matching : null
  const position = active == null ? null : active + 1
  const describedBy = [invalid ? errorId : null].filter(Boolean).join(" ") || undefined

  return (
    <div data-slot="color-picker" className={cn("flex w-64 flex-col gap-3", className)}>
      <div
        role="slider"
        tabIndex={0}
        aria-label={text.saturation}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(color.s * 100)}
        aria-valuetext={`${Math.round(color.s * 100)}% saturation, ${Math.round(color.v * 100)}% brightness`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          surfaceMoved.current = true
          moveSurface(event)
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) moveSurface(event)
        }}
        onPointerUp={() => {
          if (!surfaceMoved.current) return
          surfaceMoved.current = false
          commitEnd()
        }}
        onPointerCancel={() => {
          if (!surfaceMoved.current) return
          surfaceMoved.current = false
          commitEnd()
        }}
        onKeyDown={onSurfaceKey}
        onKeyUp={onArrowKeyUp}
        className="relative h-36 cursor-crosshair touch-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          backgroundColor: hueCss(color.h),
          backgroundImage: `linear-gradient(to top, ${black}, transparent), linear-gradient(to right, ${white}, transparent)`,
        }}
      >
        <span
          aria-hidden
          className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background shadow-sm"
          style={{ left: `${color.s * 100}%`, top: `${(1 - color.v) * 100}%`, background: hsvaToCss({ ...color, a: 1 }) }}
        />
      </div>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        {text.hue}
        <input
          type="range"
          min={0}
          max={360}
          value={Math.round(color.h)}
          aria-label={text.hue}
          aria-valuetext={`${Math.round(color.h)}°`}
          onChange={(event) => change({ ...latest.current, h: Number(event.target.value) })}
          onPointerUp={() => commitEnd()}
          onKeyUp={onArrowKeyUp}
          className="h-3 w-full cursor-pointer touch-none appearance-none rounded-full"
          style={{
            backgroundImage: `linear-gradient(to right, ${hueCss(0)}, ${hueCss(60)}, ${hueCss(120)}, ${hueCss(180)}, ${hueCss(240)}, ${hueCss(300)}, ${hueCss(360)})`,
          }}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        {text.alpha}
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(color.a * 100)}
          aria-label={text.alpha}
          aria-valuetext={`${Math.round(color.a * 100)}%`}
          onChange={(event) => change({ ...latest.current, a: Number(event.target.value) / 100 })}
          onPointerUp={() => commitEnd()}
          onKeyUp={onArrowKeyUp}
          className="h-3 w-full cursor-pointer touch-none appearance-none rounded-full"
          style={{
            backgroundColor: grayCss(80),
            backgroundImage: `linear-gradient(to right, ${hsvaToCss({ ...color, a: 0 })}, ${hsvaToCss({ ...color, a: 1 })})`,
          }}
        />
      </label>
      <div className="flex items-center gap-1.5">
        {offered.length > 1 ? (
          <div role="group" aria-label={labels.format} className="flex min-w-0 flex-1 gap-0.5 rounded-md bg-muted p-0.5">
            {offered.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={option === activeFormat}
                onClick={() => chooseFormat(option)}
                className={cn(
                  "h-7 min-w-0 flex-1 rounded-[calc(var(--radius-md)-2px)] text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  option === activeFormat && "bg-background shadow-sm",
                )}
              >
                {option === "hex" ? text.hex : labels[option]}
              </button>
            ))}
          </div>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={labels.copy}
          onClick={() => void copy()}
          className="relative ml-auto shrink-0"
        >
          <Copy
            aria-hidden
            className={cn(
              "transition-[scale,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-opacity",
              copied ? "scale-25 opacity-0 motion-reduce:scale-100" : "scale-100 opacity-100",
            )}
          />
          <Check
            aria-hidden
            className={cn(
              "absolute transition-[scale,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-opacity",
              copied ? "scale-100 opacity-100" : "scale-25 opacity-0 motion-reduce:scale-100",
            )}
          />
        </Button>
        {showEyedropper ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={text.eyedropper}
            aria-disabled={eyedropperAvailable ? undefined : true}
            aria-describedby={eyedropperAvailable ? undefined : eyedropperHintId}
            onClick={pickFromScreen}
            onBlur={() => setHint((current) => (current === "eyedropper" ? null : current))}
            className={cn("shrink-0", !eyedropperAvailable && "cursor-not-allowed opacity-50")}
          >
            <Pipette aria-hidden />
          </Button>
        ) : null}
      </div>
      <div className="flex items-end gap-2">
        <span
          aria-hidden
          data-slot="color-picker-swatch"
          className="size-9 shrink-0 rounded-md border border-border"
          style={{ background: hsvaToCss(color) }}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Label htmlFor={inputId} className="text-xs text-muted-foreground">
            {inputLabel}
          </Label>
          <Input
            id={inputId}
            value={draft ?? shown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            onFocus={() => {
              if (draft == null) setDraft(shown)
            }}
            onChange={(event) => {
              setDraft(event.target.value)
              if (invalid) setInvalid(false)
            }}
            onPaste={(event) => {
              const pasted = event.clipboardData.getData("text")
              const field = event.currentTarget
              const current = field.value
              const start = field.selectionStart ?? current.length
              const end = field.selectionEnd ?? current.length
              event.preventDefault()
              apply(current.slice(0, start) + pasted + current.slice(end))
            }}
            onBlur={() => {
              if (draft == null || draft === shown) {
                setDraft(null)
                return
              }
              apply(draft)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                if (draft != null && draft !== shown) apply(draft)
              } else if (event.key === "Escape" && (draft != null || invalid)) {
                event.preventDefault()
                setDraft(shown)
                setInvalid(false)
              }
            }}
            className={cn("font-mono", activeFormat === "hex" && !invalid && "uppercase")}
          />
        </div>
      </div>
      {invalid ? (
        <p id={errorId} className="text-xs text-destructive [overflow-wrap:anywhere]">
          {labels.invalid(quote(draft ?? ""))}
        </p>
      ) : null}
      {showEyedropper && !eyedropperAvailable ? (
        <p id={eyedropperHintId} className={cn("text-xs text-muted-foreground", hint !== "eyedropper" && "sr-only")}>
          {labels.eyedropperUnsupported}
        </p>
      ) : null}
      {saved.length || editable ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span id={savedId} className="text-xs text-muted-foreground">
              {labels.saved}
            </span>
            {editable ? (
              <Button
                ref={saveRef}
                type="button"
                variant="ghost"
                size="xs"
                aria-disabled={full || undefined}
                aria-describedby={full ? fullHintId : undefined}
                onClick={saveCurrent}
                onBlur={() => setHint((current) => (current === "full" ? null : current))}
                className={cn(full && "cursor-not-allowed opacity-50")}
              >
                <Plus aria-hidden />
                {labels.save}
              </Button>
            ) : null}
          </div>
          {saved.length ? (
            <ul aria-labelledby={savedId} className="flex flex-wrap gap-1.5">
              {saved.map((swatch, index) => {
                const label = labels.swatch(index + 1, formatColor(swatch, activeFormat))
                return (
                  <li key={`${hsvaToHex(swatch)}-${swatch.a}-${index}`}>
                    <button
                      ref={(node) => {
                        swatchRefs.current[index] = node
                      }}
                      type="button"
                      aria-pressed={sameColor(swatch, color)}
                      aria-label={label}
                      aria-keyshortcuts={editable ? "Alt+ArrowLeft Alt+ArrowRight Delete" : undefined}
                      draggable={editable}
                      onFocus={() => setActiveIndex(index)}
                      onKeyDown={(event) => onSwatchKey(event, index)}
                      onDragStart={(event) => {
                        setDragIndex(index)
                        event.dataTransfer.effectAllowed = "move"
                      }}
                      onDragOver={(event) => {
                        if (dragIndex != null) event.preventDefault()
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        if (dragIndex != null) moveSwatch(dragIndex, index)
                        setDragIndex(null)
                      }}
                      onDragEnd={() => setDragIndex(null)}
                      onClick={() => {
                        setActiveIndex(index)
                        commit(swatch)
                        onSwatchSelect?.(swatch)
                      }}
                      className={cn(
                        "block size-6 rounded-md border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                        editable && active === index && "ring-2 ring-ring/50",
                        dragIndex === index && "opacity-50",
                      )}
                      style={{ background: hsvaToCss(swatch) }}
                    />
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">{labels.savedEmpty}</p>
          )}
          {editable && saved.length ? (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={labels.moveEarlier(position)}
                aria-disabled={active == null || active === 0 || undefined}
                onClick={() => active != null && moveSwatch(active, active - 1)}
                className={cn((active == null || active === 0) && "cursor-not-allowed opacity-50")}
              >
                <ArrowLeft aria-hidden className="rtl:-scale-x-100" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={labels.moveLater(position)}
                aria-disabled={active == null || active === saved.length - 1 || undefined}
                onClick={() => active != null && moveSwatch(active, active + 1)}
                className={cn((active == null || active === saved.length - 1) && "cursor-not-allowed opacity-50")}
              >
                <ArrowRight aria-hidden className="rtl:-scale-x-100" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={labels.remove(position)}
                aria-disabled={active == null || undefined}
                onClick={() => active != null && removeSwatch(active)}
                className={cn(active == null && "cursor-not-allowed opacity-50")}
              >
                <X aria-hidden />
              </Button>
            </div>
          ) : null}
          {editable && full ? (
            <p id={fullHintId} className={cn("text-xs text-muted-foreground", hint !== "full" && "sr-only")}>
              {labels.saveFull(maxSwatches)}
            </p>
          ) : null}
        </div>
      ) : null}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}

export type ColorPickerPopoverProps = ColorPickerProps & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "center" | "end"
  triggerClassName?: string
  contentClassName?: string
}

/** The same picker behind a trigger that shows the swatch and the value together. */
export function ColorPickerPopover({
  open,
  defaultOpen,
  onOpenChange,
  align = "start",
  triggerClassName,
  contentClassName,
  value,
  defaultValue = DEFAULT_COLOR,
  onValueChange,
  format: formatProp,
  defaultFormat = "hex",
  onFormatChange,
  formats = colorFormats,
  className,
  ...picker
}: ColorPickerPopoverProps) {
  const labels: ColorPickerLabels = { ...colorPickerLabelsEn, ...picker.labels }
  const [color, setColor] = useControllable(value, defaultValue)
  const [format, setFormat] = useControllable<ColorFormat>(formatProp, defaultFormat)
  const offered = formats.length ? formats : colorFormats
  const activeFormat = offered.includes(format) ? format : offered[0]!
  const shown = formatColor(color, activeFormat)

  return (
    <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={labels.trigger(shown)}
          className={cn("max-w-full justify-start gap-2 font-mono text-xs", triggerClassName)}
        >
          <span
            aria-hidden
            data-slot="color-picker-swatch"
            className="size-4 shrink-0 rounded-sm border border-border"
            style={{ background: hsvaToCss(color) }}
          />
          <span className="truncate">{shown}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn(
          "w-auto p-3 motion-reduce:data-open:zoom-in-100 motion-reduce:data-closed:zoom-out-100 motion-reduce:data-[side=bottom]:slide-in-from-top-0 motion-reduce:data-[side=top]:slide-in-from-bottom-0",
          contentClassName,
        )}
      >
        <ColorPicker
          {...picker}
          className={className}
          value={color}
          onValueChange={(next) => {
            setColor(next)
            onValueChange?.(next)
          }}
          format={activeFormat}
          formats={offered}
          onFormatChange={(next) => {
            setFormat(next)
            onFormatChange?.(next)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
