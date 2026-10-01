"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { ContactSection } from "@/registry/blocks/contact-section"

export default function ContactSectionPreview() {
  return (
    <div className="bg-background p-3">
      <ContactSection title={`Escribe a ${atelier.name}`} description={atelier.city} topics={["Pedidos", "Visita"]} />
    </div>
  )
}
