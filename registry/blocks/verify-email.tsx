"use client"

/**
 * Clean-room verify-email card.
 * Resend follows the otp-field cooldown: the control stays disabled while the
 * clock runs. The result copy does not say whether an account exists.
 */

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { verifyCopy, type AuthLocale } from "./auth-recovery-copy"
import { AuthRecoveryFrame, AuthRecoveryLink, type AuthBrand } from "./auth-recovery-frame"
import { OtpField, type OtpFieldState } from "@/registry/retana/ui/otp-field"

export type VerifyEmailPhase = "idle" | "invalid" | "submitting" | "success" | "error" | "cooldown"

export type VerifyEmailLabels = Partial<ReturnType<typeof verifyCopy>>

export type VerifyEmailOtp = boolean | { length?: number }

export type VerifyEmailProps = {
  email?: string
  onResend: () => Promise<void>
  onVerifyCode?: (code: string) => Promise<boolean>
  onVerified?: () => void
  onSkip?: () => void
  skipHref?: string
  otp?: VerifyEmailOtp
  labels?: VerifyEmailLabels
  locale?: AuthLocale
  brand?: AuthBrand
  cooldownSeconds?: number
  /** Seconds already elapsed on the cooldown when the card opens. */
  initialCooldown?: number
  phase?: VerifyEmailPhase
  className?: string
}

function formatClock(total: number) {
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function VerifyEmail({
  email,
  onResend,
  onVerifyCode,
  onVerified,
  onSkip,
  skipHref,
  otp,
  labels,
  locale = "en",
  brand,
  cooldownSeconds = 30,
  initialCooldown = 0,
  phase,
  className,
}: VerifyEmailProps) {
  const copy = { ...verifyCopy(locale), ...labels }
  const length = typeof otp === "object" && otp.length ? otp.length : 6
  const showCode = otp !== false && (otp != null || onVerifyCode != null)
  const [internal, setInternal] = useState<VerifyEmailPhase>(initialCooldown > 0 ? "cooldown" : "idle")
  const [remaining, setRemaining] = useState(phase === "cooldown" ? cooldownSeconds : initialCooldown)
  const [busy, setBusy] = useState(false)
  const [code, setCode] = useState("")
  const [otpState, setOtpState] = useState<OtpFieldState>("idle")
  const [server, setServer] = useState(false)
  const current = phase ?? internal
  const success = current === "success"
  const submitting = current === "submitting" || busy
  const clock = formatClock(remaining)
  const waiting = remaining > 0
  const resendName = waiting ? `${copy.resendWait} ${clock}` : submitting ? copy.sending : copy.resend

  useEffect(() => {
    if (remaining <= 0) return
    const timer = window.setTimeout(() => setRemaining((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [remaining])

  async function resend() {
    if (waiting || submitting || success || phase === "submitting") return
    setBusy(true)
    setServer(false)
    setInternal("submitting")
    try {
      await onResend()
      setRemaining(cooldownSeconds)
      setCode("")
      setOtpState("idle")
      setInternal("cooldown")
    } catch {
      setServer(true)
      setInternal("error")
    } finally {
      setBusy(false)
    }
  }

  async function verify(next: string) {
    if (!onVerifyCode || submitting || next.length < length) return
    setBusy(true)
    setServer(false)
    setOtpState("idle")
    try {
      const ok = await onVerifyCode(next)
      if (ok) {
        setOtpState("success")
        setInternal("success")
        onVerified?.()
        return
      }
      setCode("")
      setOtpState("error")
      setInternal("invalid")
    } catch {
      setServer(true)
      setInternal("error")
    } finally {
      setBusy(false)
    }
  }

  const showServer = server || current === "error"

  return (
    <AuthRecoveryFrame
      slot="verify-email"
      phase={current}
      title={success ? copy.successTitle : copy.title}
      description={success ? copy.successBody : copy.description}
      status={waiting ? resendName : success ? copy.successBody : ""}
      brand={brand}
      className={className}
    >
      {success ? null : (
        <div className="grid min-w-0 gap-4">
          {email ? (
            <p className="text-sm text-muted-foreground">
              {copy.address} <span className="font-medium break-all text-foreground">{email}</span>
            </p>
          ) : null}
          {showCode ? (
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                void verify(code)
              }}
              noValidate
            >
              <OtpField
                length={length}
                label={copy.code}
                hint={copy.codeHint}
                errorLabel={copy.codeInvalid}
                successLabel={copy.codeValid}
                value={code}
                onValueChange={(next) => {
                  setCode(next)
                  if (otpState === "error" && next) setOtpState("idle")
                }}
                onComplete={(next) => void verify(next)}
                state={current === "invalid" ? "error" : otpState}
                disabled={submitting}
              />
              <Button type="submit" className="min-h-11 w-full" disabled={submitting} aria-busy={submitting || undefined}>
                {submitting ? copy.checking : copy.verify}
              </Button>
            </form>
          ) : null}
          {showServer ? (
            <p role="alert" className="text-sm text-destructive">
              {copy.serverError}
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className={cn("min-h-11 w-full", waiting && "font-normal")}
            disabled={waiting || submitting || success}
            aria-disabled={waiting || undefined}
            onClick={() => void resend()}
          >
            {resendName}
          </Button>
          {skipHref ? (
            <AuthRecoveryLink href={skipHref}>{copy.skip}</AuthRecoveryLink>
          ) : onSkip ? (
            <Button type="button" variant="ghost" className="min-h-11 w-full" onClick={onSkip}>
              {copy.skip}
            </Button>
          ) : null}
        </div>
      )}
    </AuthRecoveryFrame>
  )
}
