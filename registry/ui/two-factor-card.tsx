"use client"

import * as React from "react"
import { OTPInputContext, REGEXP_ONLY_DIGITS } from "input-otp"
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Clock,
  EllipsisVertical,
  LoaderCircle,
  Lock,
  MessageSquareDot,
  QrCode,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSeparator } from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"

/**
 * Verification card for a one-time code.
 * Visual inspiration only: Design & Code With AV, Facebook reel "2FA UI Upgrade".
 * No code from that reel was used. For the field alone, use otp-field.
 */

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)"

export type TwoFactorMethod = {
  id: string
  label: string
  icon?: React.ReactNode
  onSelect?: () => void
}

export type TwoFactorCardClassNames = {
  root?: string
  header?: string
  icon?: string
  title?: string
  description?: string
  slots?: string
  timer?: string
  submit?: string
  methods?: string
  success?: string
}

export type TwoFactorCardProps = {
  length?: number
  /** Render a separator after the midpoint. Pass a node to replace the default dash. */
  separator?: boolean | React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Return false or throw to show the error state. Resolving shows the success view. */
  onVerify?: (code: string) => void | boolean | Promise<void | boolean>
  onContinue?: () => void
  /** Fired once each time the countdown reaches zero. */
  onExpire?: () => void
  onResend?: () => void
  /** Starting length of the countdown, in seconds. Resend restores this value. */
  expiresIn?: number
  autoSubmit?: boolean
  onBack?: () => void
  onMenu?: () => void
  backLabel?: string
  menuLabel?: string
  title?: string
  description?: string
  verifyLabel?: string
  continueLabel?: string
  successTitle?: string
  successDescription?: string
  expiresLabel?: string
  resendLabel?: string
  expiredMessage?: string
  incompleteLabel?: string
  errorLabel?: string
  /** Announced at most once per remaining minute, and again at zero. */
  formatExpiryAnnouncement?: (minutes: number) => string
  methods?: TwoFactorMethod[]
  /** Primary blended toward chart-2. No fixed colors. */
  gradient?: boolean
  autoFocus?: boolean
  disabled?: boolean
  name?: string
  className?: string
  classNames?: TwoFactorCardClassNames
}

const DEFAULT_METHODS: TwoFactorMethod[] = [
  { id: "qr", label: "Scan QR code" },
  { id: "message", label: "Use message" },
]

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(REDUCE_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function usePrefersReducedMotion() {
  return React.useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCE_QUERY).matches,
    () => false,
  )
}

function formatClock(total: number) {
  const safe = Math.max(0, total)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function defaultExpiryAnnouncement(minutes: number) {
  return minutes === 1 ? "Code expires in 1 minute" : `Code expires in ${minutes} minutes`
}

function expiryAnnouncement(
  seconds: number | undefined,
  expiredMessage: string,
  format: (minutes: number) => string,
) {
  if (seconds === undefined) return ""
  if (seconds <= 0) return expiredMessage
  if (seconds % 60 === 0) return format(seconds / 60)
  return ""
}

function scopeId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "") || "code"
}

function methodIcon(method: TwoFactorMethod) {
  if (method.icon) return method.icon
  if (method.id === "qr") return <QrCode />
  if (method.id === "message") return <MessageSquareDot />
  return null
}

const successTileStyle = {
  background: "color-mix(in oklch, var(--success, var(--chart-2)) 18%, var(--background))",
  color: "var(--success, var(--chart-2))",
} as const

const gradientStyle = {
  backgroundImage:
    "linear-gradient(90deg, var(--primary), color-mix(in oklch, var(--primary) 42%, var(--chart-2)))",
} as const

function cardCss(scope: string) {
  const root = `[data-tfc="${scope}"]`
  return `
    ${root} [data-slot="two-factor-icon"][data-error="true"] {
      animation: retana-code-shake 300ms ease-out;
    }
    ${root} [data-slot="two-factor-slot"][data-filled="true"] {
      animation: retana-code-pop 200ms ease-out;
    }
    @keyframes retana-code-shake {
      0%, 100% { transform: translateX(0); }
      30% { transform: translateX(-4px); }
      60% { transform: translateX(4px); }
      80% { transform: translateX(-2px); }
    }
    @keyframes retana-code-pop {
      0% { transform: scale(0.86); }
      70% { transform: scale(1.06); }
      100% { transform: scale(1); }
    }
    @media (prefers-reduced-motion: reduce) {
      ${root} [data-slot="two-factor-icon"][data-error="true"],
      ${root} [data-slot="two-factor-slot"][data-filled="true"],
      ${root} [data-slot="two-factor-pane"] {
        animation: none;
        transition: none;
      }
    }
  `
}

function DigitSlot({ index, invalid }: { index: number; invalid: boolean }) {
  const ctx = React.useContext(OTPInputContext)
  const slot = ctx?.slots[index]
  const filled = Boolean(slot?.char)

  return (
    <div
      data-slot="two-factor-slot"
      data-active={slot?.isActive ? "true" : "false"}
      data-filled={filled ? "true" : "false"}
      data-invalid={invalid ? "true" : "false"}
      className={cn(
        "relative flex size-9 items-center justify-center rounded-xl border text-base font-semibold tabular-nums transition-colors @min-[23rem]/code:size-11",
        filled
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background text-foreground",
        slot?.isActive && !invalid && "z-10 border-ring ring-4 ring-ring/45",
        invalid && "border-destructive bg-destructive/10 text-destructive ring-destructive/25",
        invalid && slot?.isActive && "ring-4",
      )}
    >
      {slot?.char}
      {slot?.hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "h-5 w-px animate-caret-blink duration-1000",
              filled ? "bg-primary-foreground" : "bg-foreground",
            )}
          />
        </div>
      ) : null}
    </div>
  )
}

function DigitGroups({
  length,
  invalid,
  separator,
  className,
}: {
  length: number
  invalid: boolean
  separator?: boolean | React.ReactNode
  className?: string
}) {
  const indexes = Array.from({ length }, (_, index) => index)
  const groupClass =
    "gap-1.5 rounded-none border-0 bg-transparent p-0 shadow-none ring-0 @min-[23rem]/code:gap-2 has-aria-invalid:border-transparent has-aria-invalid:ring-0"
  const slots = (group: number[]) =>
    group.map((index) => <DigitSlot key={index} index={index} invalid={invalid} />)

  if (!separator) {
    return (
      <InputOTPGroup className={cn(groupClass, className)}>{slots(indexes)}</InputOTPGroup>
    )
  }

  const mid = Math.ceil(length / 2)
  return (
    <>
      <InputOTPGroup className={cn(groupClass, className)}>{slots(indexes.slice(0, mid))}</InputOTPGroup>
      {separator === true ? <InputOTPSeparator /> : separator}
      <InputOTPGroup className={cn(groupClass, className)}>{slots(indexes.slice(mid))}</InputOTPGroup>
    </>
  )
}

export function TwoFactorCard({
  length = 6,
  separator = false,
  value,
  defaultValue = "",
  onValueChange,
  onVerify,
  onContinue,
  onExpire,
  onResend,
  expiresIn,
  autoSubmit = false,
  onBack,
  onMenu,
  backLabel = "Back",
  menuLabel = "More options",
  title = "Two-factor authentication",
  description = "Enter the 6-digit code from your authentication app",
  verifyLabel = "Verify & continue",
  continueLabel = "Continue to dashboard",
  successTitle = "Verification successful",
  successDescription,
  expiresLabel = "Code expires in",
  resendLabel = "Resend code",
  expiredMessage = "Code expired",
  incompleteLabel = "Enter the full code",
  errorLabel = "That code is not valid",
  formatExpiryAnnouncement = defaultExpiryAnnouncement,
  methods = DEFAULT_METHODS,
  gradient = false,
  autoFocus = false,
  disabled = false,
  name,
  className,
  classNames,
}: TwoFactorCardProps) {
  const reduced = usePrefersReducedMotion()
  const reactId = React.useId()
  const scope = scopeId(reactId)
  const titleId = `${scope}-title`
  const descriptionId = `${scope}-description`
  const errorId = `${scope}-error`
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [phase, setPhase] = React.useState<"idle" | "error" | "loading" | "success">("idle")
  const [message, setMessage] = React.useState("")
  const [remaining, setRemaining] = React.useState(expiresIn ?? 0)
  const [spoken, setSpoken] = React.useState(() => expiryAnnouncement(expiresIn, expiredMessage, formatExpiryAnnouncement))
  const code = (value ?? uncontrolled).replace(/\D+/g, "").slice(0, length)
  const success = phase === "success"
  const invalid = phase === "error"
  const loading = phase === "loading"
  const expired = expiresIn !== undefined && remaining <= 0
  const expiredNotified = React.useRef(false)
  const inflight = React.useRef<string | null>(null)
  const remainingRef = React.useRef(expiresIn ?? 0)

  React.useEffect(() => {
    if (expiresIn === undefined || success) return
    const id = window.setInterval(() => {
      const next = remainingRef.current <= 0 ? 0 : remainingRef.current - 1
      remainingRef.current = next
      setRemaining(next)
      if (next <= 0) setSpoken(expiredMessage)
      else if (next % 60 === 0) setSpoken(formatExpiryAnnouncement(next / 60))
    }, 1000)
    return () => window.clearInterval(id)
  }, [expiresIn, expiredMessage, formatExpiryAnnouncement, success])

  React.useEffect(() => {
    if (expiresIn === undefined || success) return
    if (remaining > 0) {
      expiredNotified.current = false
      return
    }
    if (expiredNotified.current) return
    expiredNotified.current = true
    onExpire?.()
  }, [expiresIn, onExpire, remaining, success])

  const fail = React.useCallback((text: string) => {
    setPhase("error")
    setMessage(text)
  }, [])

  const runVerify = React.useCallback(
    async (current: string) => {
      if (disabled || inflight.current || phase === "success") return
      if (current.length < length) {
        fail(incompleteLabel)
        return
      }
      inflight.current = current
      setPhase("loading")
      setMessage("")
      try {
        const result = onVerify ? await onVerify(current) : true
        if (result === false) fail(errorLabel)
        else setPhase("success")
      } catch (error) {
        const text = error instanceof Error && error.message ? error.message : errorLabel
        fail(text)
      } finally {
        inflight.current = null
      }
    },
    [disabled, errorLabel, fail, incompleteLabel, length, onVerify, phase],
  )

  React.useEffect(() => {
    if (!autoSubmit || phase !== "idle" || code.length !== length) return
    const id = window.setTimeout(() => {
      void runVerify(code)
    }, 0)
    return () => window.clearTimeout(id)
  }, [autoSubmit, code, length, phase, runVerify])

  function commit(next: string) {
    const cleaned = next.replace(/\D+/g, "").slice(0, length)
    if (value === undefined) setUncontrolled(cleaned)
    onValueChange?.(cleaned)
    if (phase === "error") {
      setPhase("idle")
      setMessage("")
    }
  }

  function resend() {
    onResend?.()
    const next = Math.max(0, expiresIn ?? 0)
    remainingRef.current = next
    setRemaining(next)
    setSpoken(expiryAnnouncement(expiresIn, expiredMessage, formatExpiryAnnouncement))
    expiredNotified.current = false
    commit("")
    setPhase("idle")
    setMessage("")
  }

  const showHeader = Boolean(onBack || onMenu)

  return (
    <div
      data-slot="two-factor-card"
      data-tfc={scope}
      data-state={phase}
      data-motion={reduced ? "reduce" : "ok"}
      className={cn(
        "@container/code flex w-full min-w-0 max-w-sm flex-col gap-6 rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-xl @min-[23rem]/code:p-8",
        className,
        classNames?.root,
      )}
    >
      <style>{cardCss(scope)}</style>
      {showHeader ? (
        <div className={cn("flex items-center justify-between", classNames?.header)}>
          {onBack ? (
            <Button type="button" variant="ghost" size="icon" aria-label={backLabel} onClick={onBack}>
              <ChevronLeft />
            </Button>
          ) : (
            <span className="size-8" />
          )}
          {onMenu ? (
            <Button type="button" variant="ghost" size="icon" aria-label={menuLabel} onClick={onMenu}>
              <EllipsisVertical />
            </Button>
          ) : (
            <span className="size-8" />
          )}
        </div>
      ) : null}

      <div className="relative">
        <div
          data-slot="two-factor-pane"
          className={cn(
            "flex flex-col gap-6 transition-opacity duration-300 motion-reduce:transition-none",
            success ? "pointer-events-none absolute inset-x-0 top-0 opacity-0" : "relative opacity-100",
          )}
          aria-hidden={success || undefined}
          inert={success ? true : undefined}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              data-slot="two-factor-icon"
              data-error={invalid ? "true" : "false"}
              className={cn(
                "grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary",
                invalid && "bg-destructive/10 text-destructive",
                classNames?.icon,
              )}
            >
              <Lock className="size-6" aria-hidden />
            </div>
            <div className="flex flex-col gap-1">
              <h2 id={titleId} className={cn("text-lg font-semibold text-balance", classNames?.title)}>
                {title}
              </h2>
              <p id={descriptionId} className={cn("text-sm text-pretty text-muted-foreground", classNames?.description)}>
                {description}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <InputOTP
              name={name}
              maxLength={length}
              value={code}
              onChange={commit}
              pattern={REGEXP_ONLY_DIGITS}
              pasteTransformer={(pasted) => pasted.replace(/\D+/g, "").slice(0, length)}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus={autoFocus}
              disabled={disabled || loading || success}
              aria-labelledby={titleId}
              aria-describedby={invalid ? errorId : descriptionId}
              aria-invalid={invalid || undefined}
              containerClassName="w-full justify-center"
            >
              <div aria-hidden className="flex w-full items-center justify-center">
                <DigitGroups length={length} invalid={invalid} separator={separator} className={classNames?.slots} />
              </div>
            </InputOTP>
            {message ? (
              <p id={errorId} role="alert" data-slot="two-factor-error" className="text-center text-sm text-destructive">
                {message}
              </p>
            ) : null}
          </div>

          {expiresIn !== undefined ? (
            <div className={cn("flex min-h-8 items-center justify-center", classNames?.timer)}>
              {expired ? (
                <Button type="button" variant="ghost" size="sm" onClick={resend} disabled={disabled || loading}>
                  {resendLabel}
                </Button>
              ) : (
                <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground" aria-hidden>
                  <Clock className="size-3.5" />
                  <span>
                    {expiresLabel}{" "}
                    <span data-slot="two-factor-clock" className="font-medium text-foreground tabular-nums">
                      {formatClock(remaining)}
                    </span>
                  </span>
                </p>
              )}
              <p className="sr-only" aria-live="polite" data-slot="two-factor-expiry-live">
                {spoken}
              </p>
            </div>
          ) : null}

          <Button
            type="button"
            className={cn("w-full", classNames?.submit)}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            style={gradient ? gradientStyle : undefined}
            onClick={() => void runVerify(code)}
          >
            {loading ? <LoaderCircle data-slot="two-factor-spinner" className="animate-spin" data-icon="inline-start" /> : null}
            {verifyLabel}
            {loading ? null : <ArrowRight data-icon="inline-end" />}
          </Button>

          {methods.length > 0 ? (
            <div className={cn("grid gap-2", methods.length > 1 && "grid-cols-2", classNames?.methods)}>
              {methods.map((method) => (
                <Button
                  key={method.id}
                  type="button"
                  variant="ghost"
                  className="h-auto min-w-0 whitespace-normal px-2 py-2 text-center"
                  disabled={disabled || loading}
                  onClick={method.onSelect}
                >
                  {methodIcon(method)}
                  {method.label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>

        <div
          data-slot="two-factor-pane"
          className={cn(
            "flex flex-col items-center gap-6 text-center transition-opacity duration-300 motion-reduce:transition-none",
            success ? "relative opacity-100" : "pointer-events-none absolute inset-x-0 top-0 opacity-0",
            classNames?.success,
          )}
          aria-hidden={success ? undefined : true}
          inert={success ? undefined : true}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              data-slot="two-factor-success-icon"
              className="grid size-14 place-items-center rounded-2xl"
              style={successTileStyle}
            >
              <Check className="size-6" aria-hidden />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-balance">{successTitle}</h2>
              {successDescription ? (
                <p className="text-sm text-pretty text-muted-foreground">{successDescription}</p>
              ) : null}
            </div>
          </div>
          <Button type="button" className="w-full" style={gradient ? gradientStyle : undefined} onClick={onContinue}>
            {continueLabel}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  )
}
