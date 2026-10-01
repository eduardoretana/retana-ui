"use client"

import { PasswordField } from "@/registry/ui/password-field"

export default function PasswordFieldPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <PasswordField label="Contraseña" defaultValue="clay-2048" className="w-full" />
    </div>
  )
}
