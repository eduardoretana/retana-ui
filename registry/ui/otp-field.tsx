"use client"

import * as React from "react"
import { Check, RotateCcw } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

export type OtpFieldState = "idle" | "success" | "error"

export type OtpFieldProps = {
  length?: number
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onComplete?: (value: string) => void
  state?: OtpFieldState
  label?: string
  hint?: string
  errorLabel?: string
  successLabel?: string
  resendLabel?: string
  resendWaitLabel?: string
  /** Seconds the resend control stays disabled after each send. */
  cooldownSeconds?: number
  onResend?: () => void
  disabled?: boolean
  className?: string
}

function formatClock(total: number) {
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function OtpField({
  length = 6,
  value,
  defaultValue = "",
  onValueChange,
  onComplete,
  state = "idle",
  label = "Verification code",
  hint,
  errorLabel = "That code is not valid",
  successLabel = "Code confirmed",
  resendLabel = "Resend code",
  resendWaitLabel = "Resend in",
  cooldownSeconds = 30,
  onResend,
  disabled = false,
  className,
}: OtpFieldProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [remaining, setRemaining] = React.useState(0)
  const groupRef = React.useRef<HTMLDivElement>(null)
  const code = value ?? uncontrolled
  const describedBy = React.useId()

  React.useEffect(() => {
    if (remaining <= 0) return
    const id = window.setTimeout(() => setRemaining((current) => current - 1), 1000)
    return () => window.clearTimeout(id)
  }, [remaining])

  React.useEffect(() => {
    const node = groupRef.current
    if (!node || state === "idle") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (typeof node.animate !== "function") return
    if (state === "error") {
      node.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-5px)" },
          { transform: "translateX(5px)" },
          { transform: "translateX(-3px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 420, easing: "ease-in-out" },
      )
    } else {
      node.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }],
        { duration: 320, easing: "ease-out" },
      )
    }
  }, [state])

  function change(next: string) {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  return (
    <div data-slot="otp-field" data-state={state} className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium" id={`${describedBy}-label`}>
        {label}
      </span>
      <div ref={groupRef} className="w-fit">
        <InputOTP
          maxLength={length}
          value={code}
          onChange={change}
          onComplete={onComplete}
          disabled={disabled || state === "success"}
          aria-labelledby={`${describedBy}-label`}
          aria-describedby={describedBy}
          aria-invalid={state === "error" || undefined}
          containerClassName={cn(state === "success" && "rounded-lg ring-2 ring-primary")}
        >
          <InputOTPGroup>
            {Array.from({ length }, (_, index) => (
              <InputOTPSlot key={index} index={index} aria-invalid={state === "error" || undefined} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p
          id={describedBy}
          role={state === "error" ? "alert" : "status"}
          className={cn(
            "text-xs text-muted-foreground",
            state === "error" && "text-destructive",
            state === "success" && "text-primary",
          )}
        >
          {state === "error" ? errorLabel : state === "success" ? (
            <span className="inline-flex items-center gap-1">
              <Check className="size-3" aria-hidden />
              {successLabel}
            </span>
          ) : (
            hint
          )}
        </p>
        {onResend ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={disabled || remaining > 0 || state === "success"}
            onClick={() => {
              onResend()
              setRemaining(cooldownSeconds)
            }}
          >
            <RotateCcw />
            {remaining > 0 ? `${resendWaitLabel} ${formatClock(remaining)}` : resendLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
