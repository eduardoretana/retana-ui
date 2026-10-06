"use client"

import { NotificationInbox } from "@/registry/blocks/notification-inbox"
import {
  brumaNotificationCopy,
  brumaNotifications,
  brumaPriorities,
  brumaStatuses,
} from "@/app/examples/desk/bruma"

export function NotificationInboxDemo() {
  return (
    <NotificationInbox
      className="h-full"
      defaultNotifications={brumaNotifications}
      currentUser={{ id: "mateo", name: "Mateo Rulfo" }}
      today="2026-10-06"
      locale="es-MX"
      statuses={brumaStatuses}
      priorities={brumaPriorities}
      copy={brumaNotificationCopy}
    />
  )
}
