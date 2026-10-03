"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { PasswordStrength } from "@/registry/ui/password-strength"

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <PasswordStrength label={`Clave de ${atelier.name}`} defaultValue="Clay-2048" classNames={{ root: "max-w-sm" }} />
      <StressCases
        empty={<PasswordStrength label="Vacía" placeholder="Sin valor" />}
        long={<PasswordStrength label="Larga" defaultValue={unbreakable} />}
        crowded={
          <div className="flex flex-col gap-3">
            {people.map((person, index) => (
              <PasswordStrength key={person.id} label={person.name} defaultValue={index === 0 ? "" : `${person.role}2048!`} />
            ))}
          </div>
        }
      />
    </div>
  )
}
