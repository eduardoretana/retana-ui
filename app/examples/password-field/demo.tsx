"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { PasswordField } from "@/registry/ui/password-field"

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <PasswordField label="Contraseña del horno" description="Al menos 8 caracteres." defaultValue="clay-2048" className="max-w-sm" />
      <StressCases
        empty={<PasswordField label="Vacía" placeholder="Sin valor" />}
        long={<PasswordField label="Larga" defaultValue={unbreakable} />}
        crowded={
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }, (_, index) => (
              <PasswordField key={index} label={`Clave ${index + 1}`} defaultValue={index === 0 ? "" : `secret-${index}`} />
            ))}
          </div>
        }
      />
    </div>
  )
}
