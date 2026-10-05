"use client"

import { CrmNotifications } from "@/registry/ui/crm-notifications"
import { crmDemoNotices } from "@/registry/lib/crm-demo-data"

export default function CrmNotificationsPreview() {
  return (
    <div className="flex h-full items-start justify-end bg-background p-3">
      <CrmNotifications
        defaultItems={crmDemoNotices}
        labels={{ label: "Avisos", empty: "Sin avisos", markAll: "Marcar leídos" }}
      />
    </div>
  )
}
