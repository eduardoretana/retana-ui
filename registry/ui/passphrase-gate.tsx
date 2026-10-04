"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/security-privacy/passphrase-gate/passphrase-gate.tsx

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PasswordField } from "@/registry/retana/ui/password-field"
import { estimateStrength } from "@/registry/retana/ui/password-strength"

export type PassphraseGateProps = {
  mode?: "create" | "unlock"
  minLength?: number
  isBusy?: boolean
  error?: string
  title?: string
  description?: string
  submitLabel?: string
  onSubmit?: (passphrase: string) => void
  className?: string
}

export function PassphraseGate({
  mode = "unlock",
  minLength = 12,
  isBusy = false,
  error,
  title,
  description,
  submitLabel,
  onSubmit,
  className,
}: PassphraseGateProps) {
  const errorId = React.useId()
  const [value, setValue] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [localError, setLocalError] = React.useState<string>()
  const strength = estimateStrength(value)
  const mismatch = mode === "create" && confirm.length > 0 && confirm !== value
  const tooShort = mode === "create" && value.length > 0 && [...value].length < minLength
  const message = error ?? localError ?? (mismatch ? "Passphrases do not match." : tooShort ? `Use at least ${minLength} characters.` : undefined)

  return (
    <form
      className={cn("flex w-full max-w-sm flex-col gap-3", className)}
      onSubmit={(event) => {
        event.preventDefault()
        if (mode === "create" && (value !== confirm || [...value].length < minLength)) {
          setLocalError(value !== confirm ? "Passphrases do not match." : `Use at least ${minLength} characters.`)
          return
        }
        setLocalError(undefined)
        onSubmit?.(value)
      }}
    >
      <div>
        <h2 className="text-base font-medium">{title ?? (mode === "create" ? "Create a passphrase" : "Unlock")}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <PasswordField
        label="Passphrase"
        autoComplete={mode === "create" ? "new-password" : "current-password"}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? errorId : undefined}
        disabled={isBusy}
      />
      {mode === "create" ? (
        <>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Strength: {strength.label || "Empty"}
          </p>
          <div className="flex gap-1" aria-hidden="true">
            {[1, 2, 3, 4].map((step) => (
              <span key={step} className={cn("h-1 flex-1 rounded-full", strength.level >= step ? "bg-primary" : "bg-muted")} />
            ))}
          </div>
          <PasswordField
            label="Confirm passphrase"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            aria-invalid={mismatch ? true : undefined}
            disabled={isBusy}
          />
        </>
      ) : null}
      {message ? (
        <p id={errorId} className="text-sm text-destructive">
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={isBusy}>
        {isBusy ? "Working…" : (submitLabel ?? (mode === "create" ? "Create" : "Unlock"))}
      </Button>
    </form>
  )
}
