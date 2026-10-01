"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { SiteFooter } from "@/registry/blocks/site-footer"

export default function SiteFooterPreview() {
  return (
    <div className="bg-background">
      <SiteFooter
        variant="minimal"
        brand={{ name: atelier.name }}
        tagline={atelier.city}
        links={[{ label: "Cuencos" }, { label: "Visita" }, { label: "Contacto" }]}
        newsletter={null}
        socials={[]}
        legal={[]}
        status={null}
      />
    </div>
  )
}
