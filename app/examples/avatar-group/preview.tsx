"use client"

import { people } from "@/app/examples/arc/demo-data"
import { AvatarGroup } from "@/registry/ui/avatar-group"

export default function AvatarGroupPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <AvatarGroup members={people.slice(0, 5).map((person) => ({ name: person.name }))} label="Equipo del horno" />
    </div>
  )
}
