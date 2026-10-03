"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react"
import type { Transition, Variants } from "motion/react"
import { Check, ChevronDown, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export interface PhoneCountry {
  /** ISO 3166-1 alpha-2 code, such as "US". */
  iso: string
  name: string
  /** Country calling code without the plus, such as "44". */
  dial: string
  /** National formats from shortest to longest. `#` is a digit, anything else is a separator. */
  patterns: string[]
  /** A national number people may type before the number itself, such as "0" in "07911 123456". */
  trunk: string
  /** A realistic national number, used for the placeholder and the typing guide. */
  example: string
  /** Area codes that pick this country when several share a calling code, such as Canada inside +1. */
  areaCodes?: string[]
}

const country = (iso: string, name: string, dial: string, patterns: string | string[], example: string, trunk = "0", areaCodes?: string[]): PhoneCountry => ({
  iso,
  name,
  dial,
  patterns: Array.isArray(patterns) ? patterns : [patterns],
  example,
  trunk,
  areaCodes,
})

const CA_AREA_CODES = "204 226 236 249 250 263 289 306 343 354 365 367 368 382 387 403 416 418 428 431 437 438 450 468 474 506 514 519 548 579 581 584 587 604 613 639 647 672 683 705 709 742 753 778 780 782 807 819 825 867 873 879 902 905".split(" ")

export const PHONE_COUNTRIES: PhoneCountry[] = [
  country("US", "United States", "1", "(###) ###-####", "2015550123", "1"),
  country("CA", "Canada", "1", "(###) ###-####", "5065550123", "1", CA_AREA_CODES),
  country("MX", "Mexico", "52", "## #### ####", "2221234567", ""),
  country("BR", "Brazil", "55", ["(##) ####-####", "(##) #####-####"], "11961234567"),
  country("AR", "Argentina", "54", "## ####-####", "1123456789"),
  country("CO", "Colombia", "57", "### ### ####", "3211234567", ""),
  country("CL", "Chile", "56", "# #### ####", "221234567", ""),
  country("PE", "Peru", "51", "### ### ###", "912345678"),
  country("GB", "United Kingdom", "44", "#### ######", "7400123456"),
  country("IE", "Ireland", "353", "## ### ####", "850123456"),
  country("FR", "France", "33", "# ## ## ## ##", "612345678"),
  country("DE", "Germany", "49", ["### #######", "### ########"], "15123456789"),
  country("ES", "Spain", "34", "### ## ## ##", "612345678", ""),
  country("IT", "Italy", "39", ["### ### ###", "### ### ####"], "3123456789", ""),
  country("PT", "Portugal", "351", "### ### ###", "912345678", ""),
  country("NL", "Netherlands", "31", "# ########", "612345678"),
  country("BE", "Belgium", "32", "### ## ## ##", "470123456"),
  country("CH", "Switzerland", "41", "## ### ## ##", "781234567"),
  country("AT", "Austria", "43", ["### #######", "### ########"], "6641234567"),
  country("SE", "Sweden", "46", "## ### ## ##", "701234567"),
  country("NO", "Norway", "47", "### ## ###", "40612345", ""),
  country("DK", "Denmark", "45", "## ## ## ##", "32123456", ""),
  country("FI", "Finland", "358", ["## ### ####", "## ### #####"], "412345678"),
  country("PL", "Poland", "48", "### ### ###", "512345678", ""),
  country("CZ", "Czechia", "420", "### ### ###", "601123456", ""),
  country("GR", "Greece", "30", "### ### ####", "6912345678", ""),
  country("UA", "Ukraine", "380", "## ### ## ##", "501234567"),
  country("TR", "Turkey", "90", "### ### ## ##", "5012345678"),
  country("IL", "Israel", "972", "##-###-####", "502345678"),
  country("AE", "United Arab Emirates", "971", "## ### ####", "501234567"),
  country("SA", "Saudi Arabia", "966", "## ### ####", "512345678"),
  country("EG", "Egypt", "20", "### ### ####", "1001234567"),
  country("NG", "Nigeria", "234", "### ### ####", "8021234567"),
  country("KE", "Kenya", "254", "### ######", "712123456"),
  country("ZA", "South Africa", "27", "## ### ####", "711234567"),
  country("IN", "India", "91", "#####-#####", "8123456789"),
  country("PK", "Pakistan", "92", "### #######", "3012345678"),
  country("CN", "China", "86", "### #### ####", "13123456789"),
  country("JP", "Japan", "81", "##-####-####", "9012345678"),
  country("KR", "South Korea", "82", ["##-###-####", "##-####-####"], "1020000000"),
  country("TW", "Taiwan", "886", "### ### ###", "912345678"),
  country("HK", "Hong Kong", "852", "#### ####", "51234567", ""),
  country("SG", "Singapore", "65", "#### ####", "81234567", ""),
  country("PH", "Philippines", "63", "### ### ####", "9051234567"),
  country("ID", "Indonesia", "62", ["###-###-####", "###-####-####", "###-####-#####"], "81234567890"),
  country("TH", "Thailand", "66", "## ### ####", "812345678"),
  country("VN", "Vietnam", "84", "## ### ## ##", "912345678"),
  country("AU", "Australia", "61", "### ### ###", "412345678"),
  country("NZ", "New Zealand", "64", ["# ### ####", "## ### ####", "## #### ####"], "211234567"),
]

const BY_ISO = new Map(PHONE_COUNTRIES.map((entry) => [entry.iso, entry]))
const capacity = (pattern: string) => pattern.split("#").length - 1
const lengthsOf = (entry: PhoneCountry) => entry.patterns.map(capacity)
const capDigits = (entry: PhoneCountry, digits: string) => digits.slice(0, splitTrunk(entry, digits)[0].length + Math.max(...lengthsOf(entry)))
const onlyDigits = (text: string) => text.replace(/\D/g, "")

/** Regional indicator letters. Platforms without flag glyphs show the two letters. */
export const flagOf = (iso: string) => String.fromCodePoint(...[...iso.toUpperCase()].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65))

function splitTrunk(entry: PhoneCountry, digits: string): [string, string] {
  return entry.trunk && digits.startsWith(entry.trunk) ? [entry.trunk, digits.slice(entry.trunk.length)] : ["", digits]
}

function applyPattern(digits: string, pattern: string) {
  let out = ""
  let index = 0
  for (const char of pattern) {
    if (index >= digits.length) break
    out += char === "#" ? digits[index++] : char
  }
  return out + digits.slice(index)
}

function patternFor(entry: PhoneCountry, length: number) {
  return entry.patterns.find((pattern) => capacity(pattern) >= length) ?? entry.patterns[entry.patterns.length - 1]
}

/** Formats national digits as typed, keeping a typed trunk prefix. */
export function formatNational(entry: PhoneCountry, digits: string) {
  const [trunk, rest] = splitTrunk(entry, digits)
  const pattern = patternFor(entry, rest.length)
  const body = applyPattern(rest, pattern)
  if (!trunk) return body
  if (!rest) return trunk
  return trunk + (/^#/.test(pattern) ? "" : " ") + body
}

export type PhoneStatus = "empty" | "incomplete" | "valid" | "too-long"

function statusOf(entry: PhoneCountry, digits: string): PhoneStatus {
  const length = splitTrunk(entry, digits)[1].length
  const lengths = lengthsOf(entry)
  if (!length) return "empty"
  if (lengths.includes(length)) return "valid"
  return length > Math.max(...lengths) ? "too-long" : "incomplete"
}

const toE164 = (entry: PhoneCountry, digits: string) => {
  const rest = splitTrunk(entry, digits)[1]
  return rest ? `+${entry.dial}${rest}` : ""
}

/** Reads "+44 (0)7911 123456", "0044 7911…", or "+14165550123" into a country and national digits. */
export function parsePhoneNumber(input: string, pool: PhoneCountry[] = PHONE_COUNTRIES): { country: PhoneCountry; national: string } | null {
  const trimmed = input.trim()
  let digits = onlyDigits(trimmed)
  if (!trimmed.startsWith("+")) {
    if (!trimmed.startsWith("00")) return null
    digits = digits.slice(2)
  }
  for (const size of [3, 2, 1]) {
    const dial = digits.slice(0, size)
    const matches = pool.filter((entry) => entry.dial === dial)
    if (!matches.length) continue
    let rest = digits.slice(size)
    const entry = matches.find((item) => item.areaCodes?.some((code) => rest.startsWith(code))) ?? matches.find((item) => !item.areaCodes) ?? matches[0]
    if (entry.trunk && rest.startsWith(entry.trunk) && rest.length - entry.trunk.length >= Math.min(...lengthsOf(entry))) rest = rest.slice(entry.trunk.length)
    return { country: entry, national: capDigits(entry, rest) }
  }
  return null
}

/** Formats an E.164 number for display. Returns the input when it cannot be read. */
export function formatPhoneNumber(e164: string) {
  const parsed = parsePhoneNumber(e164)
  return parsed ? `+${parsed.country.dial} ${formatNational(parsed.country, parsed.national)}` : e164
}

export interface PhoneInputDetails {
  country: PhoneCountry
  formatted: string
  status: PhoneStatus
  valid: boolean
}

export type PhoneInputClassNames = {
  root?: string
  label?: string
  control?: string
  trigger?: string
  input?: string
  list?: string
  message?: string
}

export interface PhoneInputProps {
  label: string
  hideLabel?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string, details: PhoneInputDetails) => void
  country?: string
  defaultCountry?: string
  onCountryChange?: (iso: string) => void
  countries?: string[]
  preferredCountries?: string[]
  description?: string
  error?: string
  validate?: boolean
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
  className?: string
  classNames?: PhoneInputClassNames
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
}

type Bezier = [number, number, number, number]
const enterEase = [...motionPresets.ease.enter] as Bezier
const standardEase = [...motionPresets.ease.standard] as Bezier
const { blur } = motionPresets
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 }
}
const GROW = physical(0.4, 0.12)
const SHRINK = physical(0.32, 0)
const GLIDE = physical(0.28, 0.08)
const WIDTH = physical(0.42, 0.16)
const PANEL_MAX = 340
const CLOSED_RADIUS = 10
const OPEN_RADIUS = 16
const PAGE = 8

const subscribe = () => () => {}
function useReducedFlag() {
  const hydrated = React.useSyncExternalStore(subscribe, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

const layerVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, y: `${dir * 0.6}em`, filter: `blur(${blur.soft}px)` }),
  rest: { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } },
  exit: (dir: number) => ({ opacity: 0, y: `${dir * -0.5}em`, filter: `blur(${blur.subtle}px)`, transition: { duration: 0.12, ease: standardEase } }),
}
const layerFade: Variants = {
  enter: { opacity: 0 },
  rest: { opacity: 1, y: 0, filter: "none" },
  exit: { opacity: 0, transition: { duration: 0.08 } },
}

function matchesQuery(entry: PhoneCountry, needle: string) {
  if (!needle) return true
  const digits = onlyDigits(needle)
  if (digits && /^[+\d\s()-]+$/.test(needle)) return entry.dial.startsWith(digits) || digits.startsWith(entry.dial)
  if (needle.replace("+", "") === "") return true
  return entry.name.toLowerCase().includes(needle) || entry.iso.toLowerCase() === needle
}

function caretAfterDigits(text: string, count: number) {
  if (count <= 0) {
    const first = text.search(/\d/)
    return first < 0 ? text.length : Math.min(first, text.length)
  }
  let seen = 0
  for (let index = 0; index < text.length; index++) if (/\d/.test(text[index]) && ++seen === count) return index + 1
  return text.length
}

function MessageRow({ id, text, tone, className }: { id: string; text: string; tone: "hint" | "error"; className?: string }) {
  const reduced = useReducedFlag()
  return (
    <motion.span
      className="block overflow-hidden"
      initial={reduced ? false : { height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0, transition: reduced ? { duration: 0 } : { height: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.instant } } }}
      transition={reduced ? { duration: 0 } : { height: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.fast } }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={text}
          id={id}
          role={tone === "error" ? "alert" : undefined}
          className={cn("block pt-2 text-xs", tone === "error" ? "text-destructive" : "text-muted-foreground", className)}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: `blur(${blur.soft}px)` }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: reduced ? 0.12 : motionPresets.duration.standard, ease: enterEase }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
}

type Row = { key: string; entry: PhoneCountry }
type Section = { key: string; label?: string; rows: Row[] }

/**
 * A phone number field with a country picker. The number formats as it is typed and the value comes out in E.164.
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  {
    label,
    hideLabel = false,
    value,
    defaultValue,
    onValueChange,
    country: countryProp,
    defaultCountry = "US",
    onCountryChange,
    countries,
    preferredCountries = ["US", "CA", "GB"],
    description,
    error,
    validate = true,
    disabled = false,
    required,
    name,
    id,
    className,
    classNames,
    onBlur,
  },
  forwardedRef,
) {
  const reduced = useReducedFlag()
  const uid = React.useId()
  const inputId = id ?? `${uid}-number`
  const listId = `${uid}-list`
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const optionId = (key: string) => `${uid}-opt-${key}`

  const pool = React.useMemo(() => (countries?.length ? PHONE_COUNTRIES.filter((entry) => countries.includes(entry.iso)) : PHONE_COUNTRIES), [countries])
  const fallback = BY_ISO.get(defaultCountry) ?? PHONE_COUNTRIES[0]

  const [state, setState] = React.useState(() => {
    const parsed = parsePhoneNumber(value ?? defaultValue ?? "", pool)
    return parsed ? { iso: parsed.country.iso, digits: parsed.national } : { iso: fallback.iso, digits: "" }
  })
  const iso = countryProp ?? state.iso
  const current = BY_ISO.get(iso) ?? fallback
  const digits = state.digits
  const e164 = toE164(current, digits)

  const [seenValue, setSeenValue] = React.useState(value)
  if (value !== seenValue) {
    setSeenValue(value)
    if (value !== undefined && value !== e164) {
      const parsed = parsePhoneNumber(value, pool)
      setState(parsed ? { iso: parsed.country.iso, digits: parsed.national } : { iso, digits: "" })
    }
  }

  const formatted = formatNational(current, digits)
  const status = statusOf(current, digits)
  const [touched, setTouched] = React.useState(false)
  const lengths = lengthsOf(current)
  const lengthCopy = lengths.length === 1 ? `${lengths[0]}` : `${lengths.slice(0, -1).join(", ")} or ${lengths[lengths.length - 1]}`
  const builtIn = validate && touched && (status === "incomplete" || status === "too-long") ? `Numbers in ${current.name} have ${lengthCopy} digits` : undefined
  const message = error ?? builtIn

  const guide = React.useMemo(() => {
    const [trunk, rest] = splitTrunk(current, digits)
    if (rest.length >= current.example.length) return ""
    const full = formatNational(current, trunk + rest + current.example.slice(rest.length))
    return full.startsWith(formatted) ? full.slice(formatted.length) : ""
  }, [current, digits, formatted])

  const inputRef = React.useRef<HTMLInputElement>(null)
  React.useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement)
  const pendingCaret = React.useRef<number | null>(null)
  const [, rerender] = React.useReducer((count: number) => count + 1, 0)

  const emit = React.useCallback(
    (entry: PhoneCountry, nextDigits: string) => {
      const nextStatus = statusOf(entry, nextDigits)
      onValueChange?.(toE164(entry, nextDigits), {
        country: entry,
        formatted: formatNational(entry, nextDigits),
        status: nextStatus,
        valid: nextStatus === "valid",
      })
    },
    [onValueChange],
  )

  const setNumber = (nextDigits: string, caretDigits: number | null, entry = current) => {
    const capped = capDigits(entry, nextDigits)
    pendingCaret.current = caretDigits === null ? null : Math.min(caretDigits, capped.length)
    if (entry.iso !== current.iso) onCountryChange?.(entry.iso)
    if (capped === digits && entry.iso === current.iso) {
      rerender()
      return
    }
    setState({ iso: entry.iso, digits: capped })
    emit(entry, capped)
  }

  function placeCaret() {
    const input = inputRef.current
    const count = pendingCaret.current
    pendingCaret.current = null
    if (!input || count === null || document.activeElement !== input) return
    const position = caretAfterDigits(input.value, count)
    input.setSelectionRange(position, position)
  }
  React.useLayoutEffect(placeCaret)

  const [announcement, setAnnouncement] = React.useState("")

  function onNumberChange(input: HTMLInputElement) {
    const raw = input.value
    if (raw.includes("+") || (/^\s*00/.test(raw) && onlyDigits(raw).length > 6)) {
      const parsed = parsePhoneNumber(raw.slice(Math.max(0, raw.indexOf("+"))), pool)
      if (parsed && parsed.national) {
        if (parsed.country.iso !== current.iso) setAnnouncement(`Country set to ${parsed.country.name}`)
        setNumber(parsed.national, parsed.national.length, parsed.country)
        return
      }
    }
    const caret = input.selectionStart ?? raw.length
    setNumber(onlyDigits(raw), onlyDigits(raw.slice(0, caret)).length)
  }

  function onNumberKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const input = event.currentTarget
    if (event.key === "+" && !event.metaKey && !event.ctrlKey) {
      event.preventDefault()
      openList("+")
      return
    }
    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? 0
    if (start !== end || event.metaKey || event.ctrlKey || event.altKey) return
    if (event.key === "Backspace" && start > 0 && !/\d/.test(input.value[start - 1])) {
      event.preventDefault()
      const index = onlyDigits(input.value.slice(0, start)).length
      if (index > 0) setNumber(digits.slice(0, index - 1) + digits.slice(index), index - 1)
    }
    if (event.key === "Delete" && start < input.value.length && !/\d/.test(input.value[start])) {
      event.preventDefault()
      const index = onlyDigits(input.value.slice(0, start)).length
      setNumber(digits.slice(0, index) + digits.slice(index + 1), index)
    }
  }

  function onPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text")
    if (!text) return
    event.preventDefault()
    const input = event.currentTarget
    const parsed = /^\s*(\+|00)/.test(text) ? parsePhoneNumber(text, pool) : null
    if (parsed) {
      if (parsed.country.iso !== current.iso) setAnnouncement(`Country set to ${parsed.country.name}`)
      setNumber(parsed.national, parsed.national.length, parsed.country)
      return
    }
    let pasted = onlyDigits(text)
    if (pasted.startsWith(current.dial) && pasted.length > capDigits(current, pasted).length) pasted = pasted.slice(current.dial.length)
    if (pasted.length >= Math.min(...lengthsOf(current))) {
      setNumber(pasted, pasted.length)
      return
    }
    const a = onlyDigits(input.value.slice(0, input.selectionStart ?? 0)).length
    const b = onlyDigits(input.value.slice(0, input.selectionEnd ?? 0)).length
    setNumber(digits.slice(0, a) + pasted + digits.slice(b), a + pasted.length)
  }

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState<string | null>(null)
  const [roll, setRoll] = React.useState(1)
  const needle = query.trim().toLowerCase()

  const sections = React.useMemo<Section[]>(() => {
    const sorted = [...pool].sort((a, b) => a.name.localeCompare(b.name))
    if (needle && needle !== "+") {
      const hits = sorted.filter((entry) => matchesQuery(entry, needle))
      const digitsOnly = onlyDigits(needle)
      if (digitsOnly) hits.sort((a, b) => Number(b.dial === digitsOnly) - Number(a.dial === digitsOnly) || a.dial.length - b.dial.length)
      return [{ key: "results", rows: hits.map((entry) => ({ key: `r-${entry.iso}`, entry })) }]
    }
    const preferred = preferredCountries.map((code) => pool.find((entry) => entry.iso === code)).filter((entry): entry is PhoneCountry => !!entry)
    const all = { key: "all", label: preferred.length ? "All countries" : undefined, rows: sorted.map((entry) => ({ key: `a-${entry.iso}`, entry })) }
    return preferred.length ? [{ key: "preferred", label: "Suggested", rows: preferred.map((entry) => ({ key: `p-${entry.iso}`, entry })) }, all] : [all]
  }, [needle, pool, preferredCountries])
  const rows = React.useMemo(() => sections.flatMap((section) => section.rows), [sections])
  const activeKey = active !== null && rows.some((row) => row.key === active) ? active : (rows[0]?.key ?? null)
  const orderOf = React.useMemo(() => new Map([...pool].sort((a, b) => a.name.localeCompare(b.name)).map((entry, index) => [entry.iso, index])), [pool])

  const rootRef = React.useRef<HTMLDivElement>(null)
  const controlRef = React.useRef<HTMLDivElement>(null)
  const measureRef = React.useRef<HTMLSpanElement>(null)
  const listFaceRef = React.useRef<HTMLDivElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)
  const rowRefs = React.useRef(new Map<string, HTMLElement>())

  const anchorW = useMotionValue<number | string>("auto")
  const shapeW = useMotionValue<number | string>("100%")
  const shapeH = useMotionValue<number | string>("100%")
  const radius = useMotionValue(CLOSED_RADIUS)
  const sizes = React.useRef({ trigger: 0, lid: 0, panel: 0, list: 0 })
  const live = React.useRef({ open: false, reduced: false, measured: false })
  React.useLayoutEffect(() => {
    live.current.reduced = reduced
  }, [reduced])

  const place = React.useCallback(
    (animated: boolean) => {
      const { trigger, lid, panel, list } = sizes.current
      if (!trigger || !lid) return
      const isOpen = live.current.open
      const next = isOpen ? { w: Math.max(trigger, panel), h: lid + 2 + list, r: OPEN_RADIUS } : { w: trigger, h: lid, r: CLOSED_RADIUS }
      if (!animated || live.current.reduced || !live.current.measured) {
        anchorW.jump(trigger)
        shapeW.jump(next.w)
        shapeH.jump(next.h)
        radius.jump(next.r)
        live.current.measured = true
        return
      }
      const growing = isOpen
      animate(anchorW, trigger, WIDTH)
      animate(shapeW, next.w, growing ? GROW : SHRINK)
      animate(shapeH, next.h, growing ? GROW : SHRINK)
      animate(radius, next.r, growing ? GROW : SHRINK)
    },
    [anchorW, radius, shapeH, shapeW],
  )

  const read = React.useCallback(() => {
    const measure = measureRef.current
    const control = controlRef.current
    const face = listFaceRef.current
    const root = rootRef.current
    if (!measure || !control || !face || !root) return false
    const panel = Math.min(PANEL_MAX, control.offsetWidth)
    root.style.setProperty("--pi-panel-w", `${panel}px`)
    const previous = sizes.current
    const next = { trigger: measure.offsetWidth, lid: control.clientHeight, panel, list: face.offsetHeight }
    sizes.current = next
    return next.trigger !== previous.trigger || next.lid !== previous.lid || next.panel !== previous.panel || (live.current.open && next.list !== previous.list)
  }, [])

  React.useLayoutEffect(() => {
    const measure = measureRef.current
    const control = controlRef.current
    const face = listFaceRef.current
    if (read()) place(live.current.measured)
    if (!measure || !control || !face || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => {
      if (read()) place(live.current.measured)
    })
    observer.observe(measure)
    observer.observe(control)
    observer.observe(face)
    return () => observer.disconnect()
  }, [place, read])

  const pendingFocus = React.useRef<"trigger" | "search" | "number" | null>(null)
  React.useLayoutEffect(() => {
    if (live.current.open !== open) {
      live.current.open = open
      read()
      place(true)
    }
    const target = pendingFocus.current
    pendingFocus.current = null
    if (target === "search") searchRef.current?.focus({ preventScroll: true })
    if (target === "trigger") triggerRef.current?.focus({ preventScroll: true })
    if (target === "number") {
      const input = inputRef.current
      input?.focus({ preventScroll: true })
      input?.setSelectionRange(input.value.length, input.value.length)
    }
  }, [open, place, read])

  const hy = useMotionValue(0)
  const hh = useMotionValue(0)
  const ho = useMotionValue(0)
  const scrollIntent = React.useRef(false)
  React.useLayoutEffect(() => {
    const node = open && activeKey ? rowRefs.current.get(activeKey) : undefined
    if (!node) {
      animate(ho, 0, { duration: reduced || !open ? 0 : 0.12, ease: standardEase })
      return
    }
    const top = node.offsetTop
    const height = node.offsetHeight
    if (ho.get() < 0.05 || reduced) {
      hy.jump(top)
      hh.jump(height)
    } else {
      animate(hy, top, GLIDE)
      animate(hh, height, GLIDE)
    }
    animate(ho, 1, { duration: reduced ? 0 : 0.12, ease: enterEase })
    const scroller = scrollRef.current
    if (scroller && scrollIntent.current) {
      scrollIntent.current = false
      const pad = 6
      if (top < scroller.scrollTop + pad) scroller.scrollTop = top - pad
      else if (top + height > scroller.scrollTop + scroller.clientHeight - pad) scroller.scrollTop = top + height - scroller.clientHeight + pad
    }
  }, [activeKey, hh, ho, hy, open, reduced, sections])

  function openList(seed = "") {
    if (disabled || open) return
    setQuery(seed)
    const selectedRow = seed ? null : (sections.flatMap((section) => section.rows).find((row) => row.entry.iso === current.iso && !row.key.startsWith("p-")) ?? null)
    setActive(selectedRow?.key ?? null)
    scrollIntent.current = true
    pendingFocus.current = "search"
    setAnnouncement("")
    setOpen(true)
  }
  const close = React.useCallback((focus: "trigger" | "number" | null) => {
    pendingFocus.current = focus
    setOpen(false)
  }, [setOpen])

  function pick(entry: PhoneCountry | undefined) {
    if (!entry) return
    if (entry.iso !== current.iso) {
      setRoll(Math.sign((orderOf.get(entry.iso) ?? 0) - (orderOf.get(current.iso) ?? 0)) || 1)
      const nextDigits = capDigits(entry, digits)
      if (countryProp === undefined) setState({ iso: entry.iso, digits: nextDigits })
      else setState((last) => ({ ...last, digits: nextDigits }))
      onCountryChange?.(entry.iso)
      emit(entry, nextDigits)
      setAnnouncement(`${entry.name}, +${entry.dial}`)
    }
    close("number")
  }

  function move(key: string | null | undefined) {
    if (!key) return
    scrollIntent.current = true
    setActive(key)
  }

  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const at = rows.findIndex((row) => row.key === activeKey)
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        move(rows[Math.min(rows.length - 1, at + 1)]?.key)
        return
      case "ArrowUp":
        event.preventDefault()
        move(rows[Math.max(0, at - 1)]?.key)
        return
      case "PageDown":
        event.preventDefault()
        move(rows[Math.min(rows.length - 1, at + PAGE)]?.key)
        return
      case "PageUp":
        event.preventDefault()
        move(rows[Math.max(0, at - PAGE)]?.key)
        return
      case "Home":
        if (query) return
        event.preventDefault()
        move(rows[0]?.key)
        return
      case "End":
        if (query) return
        event.preventDefault()
        move(rows[rows.length - 1]?.key)
        return
      case "Enter":
        event.preventDefault()
        pick(rows[at]?.entry)
        return
      case "Escape":
        event.preventDefault()
        event.stopPropagation()
        close("trigger")
        return
      case "Tab":
        close(null)
        return
    }
  }

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      openList()
      return
    }
    if (event.key.length === 1 && event.key !== " " && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault()
      openList(event.key)
    }
  }

  function onQuery(next: string) {
    setQuery(next)
    setActive(null)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    const text = next.trim().toLowerCase()
    const count = text && text !== "+" ? pool.filter((entry) => matchesQuery(entry, text)).length : pool.length
    setAnnouncement(text ? (count ? `${count} ${count === 1 ? "country" : "countries"}` : "No matches") : "")
  }

  React.useEffect(() => {
    if (!open) return
    const down = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(null)
    }
    document.addEventListener("pointerdown", down)
    return () => document.removeEventListener("pointerdown", down)
  }, [close, open])

  const onRootBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null
    if (open && next && !event.currentTarget.contains(next)) close(null)
  }

  const showCheck = status === "valid"
  const invalid = !!message
  const describedBy = [description ? hintId : null, message ? errorId : null].filter(Boolean).join(" ") || undefined

  const face = (entry: PhoneCountry) => (
    <>
      <span className="inline-grid w-5 shrink-0 place-items-center text-base leading-none" aria-hidden="true">
        {flagOf(entry.iso)}
      </span>
      <span className="tabular-nums">+{entry.dial}</span>
    </>
  )

  return (
    <div
      ref={rootRef}
      data-slot="phone-input"
      className={cn("relative grid min-w-0", open && "z-30", disabled && "opacity-50", className, classNames?.root)}
      data-open={open || undefined}
      data-disabled={disabled || undefined}
      onBlur={onRootBlur}
    >
      <label htmlFor={inputId} data-slot="phone-input-label" className={cn(hideLabel ? "sr-only" : "mb-2 justify-self-start text-sm font-medium", classNames?.label)}>
        {label}
      </label>

      <div
        ref={controlRef}
        data-slot="phone-input-control"
        data-invalid={invalid || undefined}
        className={cn(
          "relative flex h-9 min-w-0 rounded-lg border border-input bg-background",
          "has-[input:focus]:border-ring has-[input:focus]:ring-3 has-[input:focus]:ring-ring/50",
          invalid && "border-destructive",
          classNames?.control,
        )}
      >
        <motion.div className="relative h-full shrink-0 after:absolute after:inset-y-2.5 after:right-0 after:w-px after:bg-border data-[open]:after:opacity-0" style={{ width: anchorW }} data-open={open || undefined}>
          <span ref={measureRef} className="invisible pointer-events-none flex h-[calc(2.25rem-2px)] w-max items-center gap-1.5 px-3 pr-8 text-sm font-medium whitespace-nowrap" aria-hidden="true">
            {face(current)}
          </span>

          <motion.div
            className={cn("absolute top-0 left-0 z-2 overflow-clip bg-background", open && "-translate-x-px -translate-y-px bg-popover shadow-md ring-1 ring-foreground/10")}
            style={{ width: shapeW, height: shapeH, borderRadius: radius }}
          >
            <div className="absolute inset-x-0 top-0 z-1 h-[calc(2.25rem-2px)]">
              <Button
                ref={triggerRef}
                type="button"
                variant="ghost"
                disabled={disabled}
                inert={open || undefined}
                tabIndex={open ? -1 : 0}
                data-slot="phone-input-trigger"
                className={cn("absolute inset-y-0.5 left-0.5 h-auto w-[calc(100%-0.375rem)] justify-start rounded-md px-2 pr-7 font-medium", classNames?.trigger)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-label={`Country, ${current.name} +${current.dial}`}
                onClick={() => (open ? close("trigger") : openList())}
                onKeyDown={onTriggerKeyDown}
              >
                <span className={cn("relative block h-full min-w-0 flex-1", open && "opacity-0")}>
                  <AnimatePresence initial={false} custom={roll}>
                    <motion.span
                      key={current.iso}
                      className="absolute inset-0 flex items-center gap-1.5"
                      custom={roll}
                      variants={reduced ? layerFade : layerVariants}
                      initial="enter"
                      animate="rest"
                      exit="exit"
                      transition={reduced ? { duration: 0.12 } : { y: GLIDE, opacity: { duration: 0.2, ease: enterEase }, filter: { duration: 0.22, ease: enterEase } }}
                    >
                      {face(current)}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </Button>

              <motion.div
                className="absolute inset-0 flex items-center gap-2 pr-0.5 pl-3"
                inert={!open || undefined}
                initial={false}
                animate={open ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: reduced ? "blur(0px)" : `blur(${blur.subtle}px)` }}
                transition={open ? { duration: 0.18, ease: enterEase, delay: reduced ? 0 : 0.05 } : { duration: 0.1, ease: standardEase }}
              >
                <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <Input
                  ref={searchRef}
                  type="text"
                  role="combobox"
                  aria-label="Search countries or calling codes"
                  aria-expanded={open}
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={open && activeKey ? optionId(activeKey) : undefined}
                  placeholder="Country or code"
                  value={query}
                  autoComplete="off"
                  spellCheck={false}
                  className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
                  onChange={(event) => onQuery(event.target.value)}
                  onKeyDown={onSearchKeyDown}
                />
                <AnimatePresence initial={false}>
                  {query ? (
                    <motion.span key="clear" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.1 } }} transition={reduced ? { duration: 0 } : GLIDE}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Clear search"
                        onPointerDown={(event) => event.preventDefault()}
                        onClick={() => {
                          onQuery("")
                          searchRef.current?.focus()
                        }}
                      >
                        <X aria-hidden="true" />
                      </Button>
                    </motion.span>
                  ) : null}
                </AnimatePresence>
                <Button type="button" variant="ghost" size="icon" aria-label="Close country list" onClick={() => close("trigger")}>
                  <ChevronDown className="size-4" aria-hidden="true" />
                </Button>
              </motion.div>

              <motion.span className="pointer-events-none absolute top-1/2 right-3 grid size-4 -translate-y-1/2 place-items-center text-muted-foreground" aria-hidden="true" initial={false} animate={{ rotate: open ? 180 : 0 }} transition={reduced ? { duration: 0 } : GLIDE}>
                <ChevronDown className="size-4" />
              </motion.span>
            </div>

            <motion.div
              ref={listFaceRef}
              data-slot="phone-input-list"
              className={cn("absolute top-[calc(2.25rem-2px)] left-0 box-border w-(--pi-panel-w) px-1.5 pb-1.5", classNames?.list)}
              inert={!open || undefined}
              aria-hidden={!open || undefined}
              initial={false}
              animate={open ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: reduced ? 0 : -6, filter: reduced ? "blur(0px)" : `blur(${blur.subtle}px)` }}
              transition={open ? { y: GROW, opacity: { duration: 0.2, ease: enterEase, delay: reduced ? 0 : 0.04 }, filter: { duration: 0.22, ease: enterEase, delay: 0.04 } } : { duration: 0.1, ease: standardEase }}
            >
              <div ref={scrollRef} className="max-h-70 overflow-y-auto overscroll-contain pt-1.5">
                <div id={listId} className="relative grid gap-0.5" role="listbox" aria-label="Countries">
                  <motion.span className="pointer-events-none absolute inset-x-0 top-0 rounded-lg bg-accent" style={{ y: hy, height: hh, opacity: ho }} aria-hidden="true" />
                  {sections.map((section) => {
                    const body = section.rows.map((row) => {
                      const selected = row.entry.iso === current.iso
                      return (
                        <div
                          key={row.key}
                          id={optionId(row.key)}
                          role="option"
                          aria-selected={selected}
                          data-active={row.key === activeKey || undefined}
                          className="relative flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground data-[active]:text-foreground aria-selected:text-foreground"
                          ref={(node) => {
                            if (node) rowRefs.current.set(row.key, node)
                            else rowRefs.current.delete(row.key)
                          }}
                          onPointerMove={(event) => {
                            if (event.pointerType === "mouse" && row.key !== activeKey) setActive(row.key)
                          }}
                          onPointerDown={(event) => event.preventDefault()}
                          onClick={() => pick(row.entry)}
                        >
                          <span className="inline-grid w-5 shrink-0 place-items-center text-base leading-none" aria-hidden="true">
                            {flagOf(row.entry.iso)}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium">{row.entry.name}</span>
                          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">+{row.entry.dial}</span>
                          <span className={cn("grid size-4 shrink-0 place-items-center", selected ? "opacity-100" : "scale-75 opacity-0")} aria-hidden="true">
                            <Check className="size-4" />
                          </span>
                        </div>
                      )
                    })
                    return section.label ? (
                      <div key={section.key} role="group" aria-labelledby={`${uid}-${section.key}`} className="grid gap-0.5">
                        <div id={`${uid}-${section.key}`} className="px-2.5 pt-2 pb-1 text-xs text-muted-foreground" role="presentation">
                          {section.label}
                        </div>
                        {body}
                      </div>
                    ) : (
                      <div key={section.key} role="presentation" className="grid gap-0.5">
                        {body}
                      </div>
                    )
                  })}
                  {rows.length === 0 ? <p className="m-0 px-2.5 py-3 text-sm text-muted-foreground">No countries match “{query.trim()}”</p> : null}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="relative flex min-w-0 flex-1 items-center">
          <span className="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-3 pr-9 text-sm text-muted-foreground/70 tabular-nums whitespace-pre" aria-hidden="true">
            <span className="invisible">{formatted}</span>
            {guide}
          </span>
          <Input
            ref={inputRef}
            id={inputId}
            data-slot="phone-input-number"
            className={cn(
              "h-full rounded-none rounded-r-lg border-0 bg-transparent px-3 pr-9 shadow-none tabular-nums focus-visible:ring-0 dark:bg-transparent",
              classNames?.input,
            )}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={formatted}
            disabled={disabled}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            aria-label={hideLabel ? label : undefined}
            onChange={(event) => onNumberChange(event.currentTarget)}
            onKeyDown={onNumberKeyDown}
            onPaste={onPaste}
            onBlur={(event) => {
              setTouched(digits.length > 0)
              onBlur?.(event)
            }}
          />
          <AnimatePresence initial={false}>
            {showCheck ? (
              <motion.span
                key="ok"
                className="pointer-events-none absolute top-1/2 right-3 grid size-4 -translate-y-1/2 place-items-center text-primary"
                aria-hidden="true"
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: `blur(${blur.subtle}px)` }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: reduced ? 1 : 0.8, transition: { duration: 0.1 } }}
                transition={reduced ? { duration: 0.12 } : motionPresets.spring.snappy}
              >
                <Check className="size-4" />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence initial={false}>{description && !message ? <MessageRow key="hint" id={hintId} text={description} tone="hint" className={classNames?.message} /> : null}</AnimatePresence>
      <AnimatePresence initial={false}>{message ? <MessageRow key="error" id={errorId} text={message} tone="error" className={classNames?.message} /> : null}</AnimatePresence>
      {name ? <input type="hidden" name={name} value={e164} /> : null}
      <span className="sr-only" role="status" aria-live="polite">
        {announcement || (showCheck ? `Valid ${current.name} number` : "")}
      </span>
    </div>
  )
})
