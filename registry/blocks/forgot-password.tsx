"use client"

/**
 * Clean-room forgot-password card.
 * The sent state is the same sentence for every address. Rejections never
 * render the host error, so the card cannot say whether an account exists.
 */

import { useId, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { forgotCopy, recoverySentBody, type AuthLocale } from "./auth-recovery-copy"
import { AuthRecoveryFrame, AuthRecoveryLink, type AuthBrand } from "./auth-recovery-frame"

export type ForgotPasswordPhase = "idle" | "invalid" | "submitting" | "sent" | "error"

export type ForgotPasswordLabels = Partial<ReturnType<typeof forgotCopy>>

export type ForgotPasswordClassNames = {
  root?: string
  form?: string
}

export type ForgotPasswordProps = {
  onSubmit: (email: string) => Promise<void>
  brand?: AuthBrand
  signInHref?: string
  labels?: ForgotPasswordLabels
  locale?: AuthLocale
  defaultEmail?: string
  /** Locked scene. Omit it and the card moves on its own. */
  phase?: ForgotPasswordPhase
  className?: string
  classNames?: ForgotPasswordClassNames
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())

export function ForgotPassword({
  onSubmit,
  brand,
  signInHref = "#",
  labels,
  locale = "en",
  defaultEmail = "",
  phase,
  className,
  classNames,
}: ForgotPasswordProps) {
  const copy = { ...forgotCopy(locale), ...labels }
  const sentBody = labels?.sentBody ?? recoverySentBody(locale)
  const emailId = useId()
  const errorId = useId()
  const [email, setEmail] = useState(defaultEmail)
  const [internal, setInternal] = useState<ForgotPasswordPhase>("idle")
  const [tried, setTried] = useState(false)
  const current = phase ?? internal
  const submitting = current === "submitting"
  const sent = current === "sent"
  const showFieldError = current === "invalid" || tried
  const problem = !email.trim() ? copy.emailRequired : !isEmail(email) ? copy.emailInvalid : ""
  const fieldError = showFieldError && !sent && current !== "error" ? problem : ""
  const server = current === "error"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || sent || phase) return
    setTried(true)
    if (problem) {
      document.getElementById(emailId)?.focus()
      return
    }
    setInternal("submitting")
    try {
      await onSubmit(email.trim())
      setInternal("sent")
    } catch {
      setInternal("error")
    }
  }

  return (
    <AuthRecoveryFrame
      slot="forgot-password"
      phase={current}
      title={sent ? copy.sentTitle : copy.title}
      description={sent ? sentBody : copy.description}
      status={sent ? copy.sentTitle : submitting ? copy.sending : ""}
      brand={brand}
      className={cn(className, classNames?.root)}
    >
      {sent ? (
        <>
          {email.trim() ? <p className="text-sm break-all text-foreground">{email.trim()}</p> : null}
          <AuthRecoveryLink href={signInHref}>{copy.back}</AuthRecoveryLink>
        </>
      ) : (
        <>
          <form className={cn("grid gap-4", classNames?.form)} onSubmit={(event) => void submit(event)} noValidate>
            <div className="grid min-w-0 gap-2">
              <Label htmlFor={emailId}>{copy.email}</Label>
              <Input
                id={emailId}
                className="min-h-11"
                type="email"
                name="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={copy.emailPlaceholder}
                value={email}
                readOnly={submitting}
                aria-invalid={fieldError ? true : undefined}
                aria-describedby={fieldError ? errorId : undefined}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (internal === "error") setInternal("idle")
                }}
              />
              {fieldError ? (
                <p id={errorId} role="alert" className="text-xs break-all text-destructive">
                  {fieldError}
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
          <AuthRecoveryLink href={signInHref}>{copy.back}</AuthRecoveryLink>
        </>
      )}
    </AuthRecoveryFrame>
  )
}
