"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { people, unbreakable } from "@/app/examples/arc/demo-data"
import { NotificationCenter, type NotificationItem } from "@/registry/blocks/notification-center"

const notes: NotificationItem[] = [
  { id: "kiln", title: "Kiln 2 reached temperature", description: `${people[0].name} marked the stoneware firing ready to review.`, time: "2m", tone: "success", actor: { name: people[0].name } },
  { id: "glaze", title: "Glaze note", description: `${people[1].name} mixed the celadon batch.`, time: "1h", actor: { name: people[1].name } },
  { id: "pack", title: "Packing slip", description: `${people[2].name} closed the gallery crate.`, time: "3h", read: true, tone: "info", actor: { name: people[2].name } },
  { id: "delay", title: "Firing delayed", description: "Kiln 2 holds until the glaze cools.", time: "Yesterday", tone: "warning" },
]

const crowd: NotificationItem[] = people.slice(0, 10).map((person, index) => ({
  id: person.id,
  title: person.role,
  description: `${person.name} left an update.`,
  time: `${index + 1}h`,
  read: index > 6,
  actor: { name: person.name },
}))

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-end">
        <NotificationCenter notifications={notes} />
      </div>
      <StressCases
        empty={<NotificationCenter notifications={[]} />}
        long={<NotificationCenter notifications={[{ id: "long", title: unbreakable, description: unbreakable, time: "now" }]} />}
        crowded={<NotificationCenter notifications={crowd} />}
      />
    </div>
  )
}
