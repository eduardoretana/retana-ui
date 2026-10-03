"use client"

import { PasswordStrength } from "@/registry/ui/password-strength"

export default function PasswordStrengthPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <PasswordStrength label="Contraseña" defaultValue="Clay-2048" classNames={{ root: "w-full" }} />
    </div>
  )
}
