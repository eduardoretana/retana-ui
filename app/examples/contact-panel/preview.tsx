"use client"

import { ContactPanel } from "@/registry/ui/contact-panel"

export default function Preview() {
  return (
    <div className="h-full bg-background">
      <ContactPanel
        className="h-full"
        contactName="Inés Soler"
        presence="online"
        presenceLabel="En línea"
        detailsLabel="Detalles"
        copilotLabel="Copiloto"
        fields={[{ id: "status", label: "Estado", value: "Abierta", readOnly: true }]}
      />
    </div>
  )
}
