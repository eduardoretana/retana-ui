"use client"

import { useState } from "react"

import { crmDemoNotices } from "@/registry/lib/crm-demo-data"
import type { CrmNotice } from "@/registry/lib/crm-companies"
import { CrmNotifications } from "@/registry/ui/crm-notifications"

export function Demo() {
  const [items, setItems] = useState<CrmNotice[]>(() => [...crmDemoNotices])
  const [picked, setPicked] = useState("Ningún aviso")
  return (
    <div className="flex flex-col items-end gap-3">
      <CrmNotifications
        items={items}
        onItemsChange={setItems}
        onSelect={(notice) => setPicked(notice.title)}
        labels={{ label: "Avisos", empty: "Sin avisos", markAll: "Marcar leídos" }}
      />
      <p className="text-sm text-muted-foreground">Último aviso: {picked}</p>
    </div>
  )
}
