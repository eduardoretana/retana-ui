"use client"

import { people, unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { AvatarGroup } from "@/registry/ui/avatar-group"

const crew = people.map((person, index) => ({
  name: person.name,
  status: index === 0 ? ("online" as const) : index === 3 ? ("offline" as const) : undefined,
}))

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <AvatarGroup members={crew.slice(0, 6)} max={4} label="Equipo del horno" />
      <StressCases
        empty={<AvatarGroup members={[]} label="Sin equipo" />}
        long={<AvatarGroup members={[{ name: unbreakable }]} label="Nombre largo" />}
        crowded={<AvatarGroup members={crew} max={10} label="Todo el taller" />}
      />
    </div>
  )
}
