"use client"

import { TwoFactorCard } from "@/registry/ui/two-factor-card"

export default function TwoFactorCardPreview() {
  return (
    <div className="flex h-full items-start justify-center overflow-hidden bg-background">
      <div className="origin-top scale-[0.42] pt-3">
        <TwoFactorCard
          gradient
          defaultValue="12"
          expiresIn={180}
          onBack={() => {}}
          onMenu={() => {}}
          title="Verificación"
          description="Código de seis dígitos"
          verifyLabel="Continuar"
          methods={[
            { id: "qr", label: "Código QR" },
            { id: "message", label: "Mensaje" },
          ]}
        />
      </div>
    </div>
  )
}
