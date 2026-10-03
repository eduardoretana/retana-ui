"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { SiteHeader, type SiteHeaderItem } from "@/registry/blocks/site-header"

const items: SiteHeaderItem[] = [
  { value: "trabajo", label: "Trabajo", links: [{ label: "Cuencos", description: "Gres de todos los días" }, { label: "Juegos", description: "Para la galería" }] },
  { value: "visita", label: "Visita" },
  { value: "horno", label: "Horno" },
]

export default function SiteHeaderPreview() {
  return (
    <div className="bg-background">
      <SiteHeader sticky={false} brand={{ name: atelier.name }} items={items} secondaryAction={{ label: "Entrar" }} primaryAction={{ label: "Escribir" }} />
    </div>
  )
}
