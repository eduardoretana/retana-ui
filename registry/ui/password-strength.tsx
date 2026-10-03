"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type Transition, type Variants } from "motion/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type PasswordRule = {
  id: string
  label: string
  test: (password: string) => boolean
  /** Characters still missing. Shown as a rolling count beside the rule while it is unmet. */
  remaining?: (password: string) => number
}

export type PasswordStrengthResult = {
  level: 0 | 1 | 2 | 3 | 4
  label: string
  met: string[]
}

export type PasswordStrengthClassNames = {
  root?: string
  label?: string
  shell?: string
  input?: string
  toggle?: string
  meter?: string
  rules?: string
  error?: string
}

export type PasswordStrengthProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "defaultValue" | "children"
> & {
  label: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string, strength: PasswordStrengthResult) => void
  /** Rules to check. Strength is the share of rules met, spread over four steps. */
  rules?: PasswordRule[]
  /** Error copy tied to the field. The field shakes once each time a new error appears. */
  error?: string
  revealed?: boolean
  onRevealedChange?: (revealed: boolean) => void
  classNames?: PasswordStrengthClassNames
}

const count = (password: string) => Array.from(password).length

export const defaultPasswordRules: PasswordRule[] = [
  {
    id: "length",
    label: "At least 12 characters",
    test: (password) => count(password) >= 12,
    remaining: (password) => Math.max(0, 12 - count(password)),
  },
  { id: "case", label: "Upper and lowercase letters", test: (password) => /\p{Ll}/u.test(password) && /\p{Lu}/u.test(password) },
  { id: "number", label: "At least one number", test: (password) => /\p{N}/u.test(password) },
  { id: "symbol", label: "At least one symbol", test: (password) => /[^\p{L}\p{N}\s]/u.test(password) },
]

const LEVELS = ["", "Weak", "Fair", "Good", "Strong"] as const
const SHORT = 8

export function estimateStrength(password: string, rules: PasswordRule[] = defaultPasswordRules): PasswordStrengthResult {
  if (!password) return { level: 0, label: "", met: [] }
  const met = rules.filter((rule) => rule.test(password)).map((rule) => rule.id)
  if (count(password) < SHORT) return { level: 1, label: "Too short", met }
  const level = Math.min(4, Math.max(1, Math.round((met.length / Math.max(rules.length, 1)) * 4))) as 1 | 2 | 3 | 4
  return { level, label: LEVELS[level], met }
}

const enter = [...motionPresets.ease.enter] as [number, number, number, number]
const standard = [...motionPresets.ease.standard] as [number, number, number, number]
const subscribe = () => () => {}
const useHydrated = () => React.useSyncExternalStore(subscribe, () => true, () => false)

const rise: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${0.3 * direction}em`, filter: `blur(${motionPresets.blur.soft}px)` }),
  center: { opacity: 1, y: "0em", filter: "blur(0px)", transition: { duration: 0.22, ease: enter } },
  exit: (direction: number) => ({
    opacity: 0,
    y: `${-0.3 * direction}em`,
    filter: `blur(${motionPresets.blur.subtle}px)`,
    transition: { duration: 0.15, ease: standard },
  }),
}

const fade: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
}

const roll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${0.45 * direction}em`, filter: `blur(${motionPresets.blur.subtle}px)` }),
  center: {
    opacity: 1,
    y: "0em",
    filter: "blur(0px)",
    transition: {
      y: motionPresets.spring.snappy,
      opacity: { duration: motionPresets.duration.fast },
      filter: { duration: motionPresets.duration.fast },
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    y: `${-0.45 * direction}em`,
    filter: `blur(${motionPresets.blur.subtle}px)`,
    transition: { duration: 0.14, ease: standard },
  }),
}

const toneClass: Record<number, string> = {
  0: "bg-muted-foreground/40",
  1: "bg-destructive",
  2: "bg-primary/50",
  3: "bg-primary",
  4: "bg-primary",
}

function RollingNumber({ value, reduced }: { value: number; reduced: boolean }) {
  const [track, setTrack] = React.useState({ value, direction: 1 })
  if (track.value !== value) setTrack({ value, direction: value > track.value ? 1 : -1 })
  const digits = String(value).split("")
  return (
    <span className="inline-flex tabular-nums">
      <AnimatePresence initial={false} custom={track.direction}>
        {digits.map((digit, index) => (
          <motion.span
            key={digits.length - 1 - index}
            className="relative inline-block overflow-x-clip"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : { width: motionPresets.spring.morph, opacity: { duration: motionPresets.duration.fast } }
            }
          >
            <AnimatePresence mode="popLayout" initial={false} custom={track.direction}>
              <motion.span
                key={digit}
                className="inline-block"
                custom={track.direction}
                variants={reduced ? fade : roll}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {digit}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  )
}

function EyeMorph({ slashed, reduced }: { slashed: boolean; reduced: boolean }) {
  const maskId = `eye-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const slash = { pathLength: slashed ? 1 : 0, opacity: slashed ? 1 : 0 }
  const transition: Transition = reduced
    ? { duration: 0 }
    : {
        pathLength: { duration: motionPresets.duration.standard, ease: standard },
        opacity: { duration: motionPresets.duration.instant },
      }
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="white" stroke="none" />
        <motion.path d="M3 3l18 18" stroke="black" strokeWidth={5} initial={false} animate={slash} transition={transition} />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </g>
      <motion.path d="M3 3l18 18" initial={false} animate={slash} transition={transition} />
    </svg>
  )
}

function RuleMark({ met, delay, reduced }: { met: boolean; delay: number; reduced: boolean }) {
  return (
    <span className="relative block size-4 shrink-0 rounded-full border border-input text-primary" aria-hidden="true">
      <motion.span
        className="absolute -inset-px rounded-full bg-primary/15"
        initial={false}
        animate={{ scale: met ? 1 : 0.5, opacity: met ? 1 : 0 }}
        transition={
          reduced
            ? { duration: 0 }
            : {
                scale: { ...motionPresets.spring.snappy, delay },
                opacity: { duration: met ? motionPresets.duration.fast : motionPresets.duration.instant, delay },
              }
        }
      />
      <svg className="absolute -inset-px size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M4.75 8.25 7 10.5l4.25-4.75"
          initial={false}
          animate={{ pathLength: met ? 1 : 0, opacity: met ? 1 : 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : met
                ? {
                    pathLength: { duration: motionPresets.duration.standard, ease: enter, delay: delay + 0.06 },
                    opacity: { duration: 0.05, delay: delay + 0.06 },
                  }
                : {
                    pathLength: { duration: motionPresets.duration.fast, ease: standard },
                    opacity: { duration: motionPresets.duration.fast, delay: 0.06 },
                  }
          }
        />
      </svg>
    </span>
  )
}

function ErrorRow({ id, text, reduced, className }: { id: string; text: string; reduced: boolean; className?: string }) {
  const copy = React.useRef<HTMLSpanElement>(null)
  const [height, setHeight] = React.useState<number | "auto">("auto")
  React.useEffect(() => {
    const node = copy.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return (
    <motion.span
      className="block overflow-hidden"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height, opacity: 1 }}
      exit={{
        height: 0,
        opacity: 0,
        transition: reduced
          ? { duration: 0 }
          : { height: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.instant } },
      }}
      transition={
        reduced
          ? { duration: 0 }
          : { height: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.fast } }
      }
    >
      <span ref={copy} id={id} className={cn("relative block pt-2 text-xs text-destructive break-all", className)}>
        <AnimatePresence mode="popLayout" initial={false} custom={1}>
          <motion.span key={text} className="block" custom={1} variants={reduced ? fade : rise} initial="enter" animate="center" exit="exit">
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.span>
  )
}

export const PasswordStrength = React.forwardRef<HTMLInputElement, PasswordStrengthProps>(function PasswordStrength(
  {
    label,
    value: valueProp,
    defaultValue = "",
    onValueChange,
    onChange,
    rules = defaultPasswordRules,
    error,
    revealed: revealedProp,
    onRevealedChange,
    id,
    className,
    classNames,
    ...props
  },
  ref,
) {
  const generated = React.useId()
  const controlId = id ?? generated
  const rulesId = `${controlId}-rules`
  const errorId = `${controlId}-error`
  const hydrated = useHydrated()
  const prefersReduced = useReducedMotion()
  const reduced = hydrated && !!prefersReduced
  const [internal, setInternal] = React.useState(defaultValue)
  const value = valueProp ?? internal
  const [revealedInternal, setRevealedInternal] = React.useState(false)
  const revealed = revealedProp ?? revealedInternal
  const strength = estimateStrength(value, rules)
  const met = new Set(strength.met)

  const rank = strength.label === "Too short" ? 0.5 : strength.level
  const metKey = strength.met.join(" ")
  const [track, setTrack] = React.useState({
    rank,
    level: strength.level,
    previousLevel: strength.level,
    direction: 1,
    metKey,
    previousMet: metKey,
  })
  if (track.rank !== rank || track.metKey !== metKey) {
    setTrack({
      rank,
      level: strength.level,
      previousLevel: track.rank !== rank ? track.level : track.previousLevel,
      direction: track.rank === rank ? track.direction : rank > track.rank ? 1 : -1,
      metKey,
      previousMet: track.metKey !== metKey ? track.metKey : track.previousMet,
    })
  }
  const previousMet = new Set(track.previousMet.split(" ").filter(Boolean))
  const changed = rules.filter((rule) => met.has(rule.id) !== previousMet.has(rule.id)).map((rule) => rule.id)

  const [reveal, setReveal] = React.useState({ revealed, changed: false })
  if (reveal.revealed !== revealed) setReveal({ revealed, changed: true })

  const shake = useMotionValue(0)
  const shaking = React.useRef<{ stop: () => void } | null>(null)
  const lastError = React.useRef(error)
  React.useEffect(() => {
    const previous = lastError.current
    lastError.current = error
    if (!error || error === previous || reduced) return
    shaking.current?.stop()
    shaking.current = animate(shake, 0, { type: "spring", velocity: -240, stiffness: 900, damping: 15, restDelta: 0.1 })
  }, [error, reduced, shake])

  function toggleReveal() {
    if (revealedProp === undefined) setRevealedInternal(!revealed)
    onRevealedChange?.(!revealed)
  }

  const summary = strength.level ? `Strength: ${strength.label}. ${strength.met.length} of ${rules.length} requirements met.` : ""
  const describedBy = [props["aria-describedby"], error ? errorId : undefined, rulesId].filter(Boolean).join(" ")

  return (
    <div data-slot="password-strength" data-level={strength.level} className={cn("grid min-w-0 max-w-full", classNames?.root)}>
      <Label htmlFor={controlId} data-slot="password-strength-label" className={cn("mb-2", classNames?.label)}>
        {label}
      </Label>
      <motion.div
        data-slot="password-strength-shell"
        className={cn(
          "flex h-9 min-w-0 items-center rounded-lg border border-input bg-background pr-1 pl-1 shadow-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-[[aria-invalid=true]]:border-destructive motion-reduce:transition-none",
          classNames?.shell,
        )}
        style={{ x: shake }}
      >
        <Input
          autoComplete="new-password"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          {...props}
          ref={ref}
          id={controlId}
          type={revealed ? "text" : "password"}
          value={value}
          onChange={(event) => {
            const next = event.target.value
            if (valueProp === undefined) setInternal(next)
            onChange?.(event)
            onValueChange?.(next, estimateStrength(next, rules))
          }}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={describedBy}
          data-reveal={reveal.changed ? (revealed ? "shown" : "hidden") : undefined}
          className={cn(
            "h-8 border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
            className,
            classNames?.input,
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-slot="password-strength-toggle"
          className={cn("text-muted-foreground aria-pressed:text-foreground", classNames?.toggle)}
          onClick={toggleReveal}
          aria-label="Show password"
          aria-pressed={revealed}
          aria-controls={controlId}
        >
          <EyeMorph slashed={revealed} reduced={reduced} />
        </Button>
      </motion.div>
      <AnimatePresence initial={false}>
        {error ? <ErrorRow key="error" id={errorId} text={error} reduced={reduced} className={classNames?.error} /> : null}
      </AnimatePresence>
      <div className="mt-3 flex items-center gap-3">
        <div
          data-slot="password-strength-meter"
          className={cn("grid min-w-0 flex-1 grid-cols-4 gap-1", classNames?.meter)}
          role="meter"
          aria-label="Password strength"
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={strength.level}
          aria-valuetext={strength.level ? strength.label : "No password yet"}
        >
          {[0, 1, 2, 3].map((index) => {
            const on = index < strength.level
            const wave = on ? index - track.previousLevel : track.previousLevel - 1 - index
            return (
              <span key={index} className="relative h-1 overflow-hidden rounded-full bg-muted">
                <motion.span
                  className={cn("absolute inset-0 rounded-full", toneClass[strength.level])}
                  initial={false}
                  animate={{ x: on ? "0%" : "-101%" }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { ...motionPresets.spring.smooth, delay: Math.max(0, wave) * (on ? 0.05 : 0.03) }
                  }
                />
              </span>
            )
          })}
        </div>
        <span className="relative block h-[1.4em] w-[4.5rem] shrink-0 text-right text-sm font-medium whitespace-nowrap text-foreground" aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false} custom={track.direction}>
            {strength.level ? (
              <motion.span
                key={strength.label}
                className="inline-block"
                custom={track.direction}
                variants={reduced ? fade : rise}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {strength.label}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      </div>
      <ul id={rulesId} data-slot="password-strength-rules" className={cn("mt-4 grid list-none gap-1.5 p-0", classNames?.rules)} aria-label="Password requirements">
        {rules.map((rule) => {
          const ok = met.has(rule.id)
          const remaining = value && !ok ? (rule.remaining?.(value) ?? 0) : 0
          const order = changed.indexOf(rule.id)
          return (
            <li key={rule.id} className={cn("flex min-h-5 min-w-0 items-center gap-2.5 text-sm", ok ? "text-foreground" : "text-muted-foreground")} data-met={ok || undefined}>
              <RuleMark met={ok} delay={order > 0 ? order * 0.05 : 0} reduced={reduced} />
              <span className="min-w-0 break-all">
                {rule.label}
                <span className="sr-only">{ok ? ", met" : ", not met"}</span>
              </span>
              <span className="relative ml-auto block pl-2 text-xs whitespace-nowrap text-muted-foreground" aria-hidden="true">
                <AnimatePresence mode="popLayout" initial={false} custom={1}>
                  {remaining > 0 ? (
                    <motion.span
                      key="remaining"
                      className="inline-flex items-baseline gap-[0.28em]"
                      custom={1}
                      variants={reduced ? fade : rise}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <RollingNumber value={remaining} reduced={reduced} /> more
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </span>
            </li>
          )
        })}
      </ul>
      <span className="sr-only" role="status">
        {summary}
      </span>
    </div>
  )
})
