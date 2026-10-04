"use client"

import { useState } from "react"

import { TwoFactorCard } from "@/registry/ui/two-factor-card"

const SUCCESS_CODE = "246810"

export function Demo() {
  const [note, setNote] = useState("El código 246810 continúa. Cualquier otro muestra el error.")

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="max-w-sm text-center text-sm text-muted-foreground">{note}</p>
      <TwoFactorCard
        gradient
        expiresIn={180}
        autoFocus
        title="Verificación en dos pasos"
        description="Escribe el código de seis dígitos de tu aplicación."
        verifyLabel="Verificar y continuar"
        continueLabel="Ir al tablero"
        successTitle="Verificación lista"
        successDescription="Ya puedes entrar al taller."
        expiresLabel="El código vence en"
        resendLabel="Reenviar código"
        expiredMessage="El código venció"
        incompleteLabel="Falta el código completo"
        errorLabel="Ese código no coincide"
        backLabel="Volver"
        menuLabel="Más opciones"
        onBack={() => setNote("Volviste al paso anterior.")}
        onMenu={() => setNote("Abriste más opciones.")}
        onContinue={() => setNote("Continuaste al tablero.")}
        onResend={() => setNote("Enviamos otro código.")}
        methods={[
          {
            id: "qr",
            label: "Escanear código QR",
            onSelect: () => setNote("Elegiste escanear el código QR."),
          },
          {
            id: "message",
            label: "Usar mensaje",
            onSelect: () => setNote("Elegiste recibir un mensaje."),
          },
        ]}
        onVerify={async (code) => {
          await new Promise((resolve) => window.setTimeout(resolve, 500))
          return code === SUCCESS_CODE
        }}
      />
    </div>
  )
}
