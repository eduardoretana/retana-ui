"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { UserMenu } from "@/registry/ui/user-menu"

export default function UserMenuPreview() {
  return (
    <div className="flex h-full items-center justify-end bg-background p-3">
      <UserMenu
        user={{ name: "Inés Calderón", email: atelier.email, plan: "Studio" }}
        showName
        status="available"
        onStatusChange={() => {}}
        onThemeChange={() => {}}
        onSignOut={() => {}}
        items={[{ label: "Perfil" }]}
      />
    </div>
  )
}
