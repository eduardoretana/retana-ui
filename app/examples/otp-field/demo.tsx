"use client"

import { useState } from "react"

import { OtpField, type OtpFieldState } from "@/registry/ui/otp-field"

export function Demo() {
  const [value, setValue] = useState("")
  const [state, setState] = useState<OtpFieldState>("idle")

  return (
    <OtpField
      value={value}
      onValueChange={(next) => {
        setValue(next)
        if (state !== "idle") setState("idle")
      }}
      onComplete={(code) => setState(code === "246810" ? "success" : "error")}
      state={state}
      label="Código de verificación"
      hint="Usa 246810 para ver el estado de éxito."
      errorLabel="Ese código no coincide"
      successLabel="Código confirmado"
      resendLabel="Reenviar código"
      resendWaitLabel="Reenviar en"
      cooldownSeconds={15}
      onResend={() => {
        setValue("")
        setState("idle")
      }}
    />
  )
}
