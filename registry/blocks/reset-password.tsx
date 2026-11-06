"use client"

/**
 * Clean-room reset-password card.
 * Strength comes from password-strength. The confirmation field is password-field.
 * A bad or expired link replaces the form. Host errors are never shown raw.
 */

import { useId, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { resetCopy, type AuthLocale } from "./auth-recovery-copy"
import { AuthRecoveryFrame, AuthRecoveryLink, type AuthBrand } from "./auth-recovery-frame"
import { PasswordField } from "@/registry/retana/ui/password-field"
import { PasswordStrength, defaultPasswordRules, type PasswordRule } from "@/registry/retana/ui/password-strength"

export type ResetPasswordPhase = "idle" | "invalid" | "submitting" | "success" | "error"
export type ResetTokenState = "ok" | "invalid" | "expired"

export type ResetPasswordLabels = Partial<ReturnType<typeof resetCopy>>

export type ResetPasswordProps = {
  onSubmit: (values: { password: string }) => Promise<void>
  passwordRules?: PasswordRule[]
  tokenState?: ResetTokenState
  brand?: AuthBrand
  signInHref?: string
  requestHref?: string
  labels?: ResetPasswordLabels
  locale?: AuthLocale
  defaultPassword?: string
  defaultConfirm?: string
  phase?: ResetPasswordPhase
  className?: string
}

export function ResetPassword({
  onSubmit,
  passwordRules,
  tokenState = "ok",
  brand,
  signInHref = "#",
  requestHref = "#",
  labels,
  locale = "en",
  defaultPassword = "",
  defaultConfirm = "",
  phase,
  className,
}: ResetPasswordProps) {
  const copy = { ...resetCopy(locale), ...labels }
  const rules =
    passwordRules ??
    defaultPasswordRules.map((rule) => {
      const label =
        rule.id === "length" ? copy.ruleLength : rule.id === "case" ? copy.ruleCase : rule.id === "number" ? copy.ruleNumber : copy.ruleSymbol
      return { ...rule, label }
    })
  const confirmId = useId()
  const matchId = useId()
  const [password, setPassword] = useState(defaultPassword)
  const [confirm, setConfirm] = useState(defaultConfirm)
  const [internal, setInternal] = useState<ResetPasswordPhase>("idle")
  const [tried, setTried] = useState(false)
  const current = phase ?? internal
  const meets = rules.every((rule) => rule.test(password))
  const showProblems = current === "invalid" || tried
  const rulesError = showProblems && !meets ? copy.rules : ""
  const matchError = showProblems && meets && password !== confirm ? copy.mismatch : ""
  const submitting = current === "submitting"
  const success = current === "success"
  const server = current === "error"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || success || phase) return
    setTried(true)
    if (!meets || password !== confirm) return
    setInternal("submitting")
    try {
      await onSubmit({ password })
      setInternal("success")
    } catch {
      setInternal("error")
    }
  }

  if (tokenState === "invalid" || tokenState === "expired") {
    const expired = tokenState === "expired"
    return (
      <AuthRecoveryFrame
        slot="reset-password"
        phase={expired ? "expired" : "invalid-link"}
        title={expired ? copy.expiredTitle : copy.invalidTitle}
        description={expired ? copy.expiredBody : copy.invalidBody}
        brand={brand}
        className={className}
      >
        <AuthRecoveryLink href={requestHref}>{copy.request}</AuthRecoveryLink>
      </AuthRecoveryFrame>
    )
  }

  return (
    <AuthRecoveryFrame
      slot="reset-password"
      phase={current}
      title={success ? copy.successTitle : copy.title}
      description={success ? copy.successBody : copy.description}
      status={success ? copy.successBody : submitting ? copy.sending : ""}
      brand={brand}
      className={className}
    >
      {success ? (
        <AuthRecoveryLink href={signInHref}>{copy.back}</AuthRecoveryLink>
      ) : (
        <form className="grid min-w-0 gap-4" onSubmit={(event) => void submit(event)} noValidate>
          <PasswordStrength
            label={copy.password}
            value={password}
            rules={rules}
            error={rulesError || undefined}
            autoComplete="new-password"
            readOnly={submitting}
            classNames={{ shell: "min-h-11", toggle: "min-h-11 min-w-11" }}
            copy={{
              show: copy.show,
              hide: copy.hide,
              tooShort: copy.tooShort,
              weak: copy.weak,
              fair: copy.fair,
              good: copy.good,
              strong: copy.strong,
              empty: copy.empty,
              more: copy.more,
              meter: copy.meter,
              requirements: copy.requirements,
              met: copy.met,
              unmet: copy.unmet,
            }}
            onValueChange={(next) => {
              setPassword(next)
              if (internal === "error") setInternal("idle")
            }}
          />
          <div className="grid min-w-0 gap-2">
            <PasswordField
              id={confirmId}
              label={copy.confirm}
              name="confirm-password"
              autoComplete="new-password"
              value={confirm}
              readOnly={submitting}
              showLabel={copy.show}
              hideLabel={copy.hide}
              aria-invalid={matchError ? true : undefined}
              aria-describedby={matchError ? matchId : undefined}
              classNames={{ shell: "min-h-11", toggle: "min-h-11 min-w-11" }}
              onChange={(event) => {
                setConfirm(event.target.value)
                if (internal === "error") setInternal("idle")
              }}
            />
            {matchError ? (
              <p id={matchId} role="alert" className="text-xs text-destructive">
                {matchError}
              </p>
            ) : null}
          </div>
          {server ? (
            <p role="alert" className="text-sm text-destructive">
              {copy.serverError}
            </p>
          ) : null}
          <Button type="submit" className="min-h-11 w-full" disabled={submitting} aria-busy={submitting || undefined}>
            {submitting ? copy.sending : copy.submit}
          </Button>
        </form>
      )}
    </AuthRecoveryFrame>
  )
}
