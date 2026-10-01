"use client"

import { people } from "@/app/examples/arc/demo-data"
import { NotificationCenter } from "@/registry/blocks/notification-center"

export default function NotificationCenterPreview() {
  return (
    <div className="flex h-full items-start justify-end bg-background p-3">
      <NotificationCenter
        notifications={[
          { id: "kiln", title: "Kiln 2 reached temperature", description: `${people[0].name} marked the firing ready.`, time: "2m", tone: "success", actor: { name: people[0].name } },
          { id: "glaze", title: "Glaze note", description: `${people[1].name} mixed celadon.`, time: "1h", actor: { name: people[1].name } },
        ]}
      />
    </div>
  )
}
