"use client"

import { useState } from "react"
import { Settings, UserRound } from "lucide-react"

import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { UserMenu, type ThemePreference } from "@/registry/ui/user-menu"

export function Demo() {
  const [theme, setTheme] = useState<ThemePreference>("system")
  const [note, setNote] = useState("Sesión del taller")
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-end">
        <UserMenu
          user={{ name: "Inés Calderón", email: atelier.email, plan: "Studio" }}
          showName
          theme={theme}
          onThemeChange={setTheme}
          status="available"
          onStatusChange={() => {}}
          items={[
            { label: "Perfil", icon: <UserRound />, onSelect: () => setNote("Perfil") },
            { label: "Ajustes", icon: <Settings />, keys: ["⌘", ","], onSelect: () => setNote("Ajustes") },
          ]}
          onSignOut={() => setNote("Sesión cerrada")}
        />
      </div>
      <p className="text-sm text-muted-foreground">{note} · tema {theme}</p>
      <StressCases
        empty={<UserMenu user={{ name: "Vacío", email: "—" }} showTheme={false} items={[]} onSignOut={() => {}} />}
        long={<UserMenu user={{ name: unbreakable, email: unbreakable, plan: "Studio" }} showName showTheme={false} onSignOut={() => {}} />}
        crowded={
          <UserMenu
            user={{ name: "Inés Calderón", email: atelier.email }}
            showTheme={false}
            items={people.map((person) => ({ label: person.name, onSelect: () => {} }))}
            onSignOut={() => {}}
          />
        }
      />
    </div>
  )
}
