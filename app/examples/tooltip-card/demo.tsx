"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { TooltipCard } from "@/registry/ui/tooltip-card"
import { tooltipCardLabelsEn } from "@/registry/ui/tooltip-card"

import { demoPeople } from "../portfolio-desk/data"

export function TooltipCardDemo() {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <TooltipCard
        title="Catálogo de feria"
        eyebrow="Impresión"
        description="32 páginas. La guarda todavía no tiene tinta."
        people={demoPeople}
        metrics={[
          { id: "pliegos", label: "Pliegos", value: "120" },
          { id: "estado", label: "Estado", value: "En curso" },
        ]}
        actions={[{ id: "open", label: "Abrir ficha", onSelect: () => toast("Ficha abierta en el anfitrión.") }]}
      >
        <Button type="button">Ver encargo</Button>
      </TooltipCard>
      <TooltipCard title="Shipping labels" eyebrow="Shop" description="Waiting on adhesive stock." labels={tooltipCardLabelsEn} metrics={[{ id: "status", label: "Status", value: "Blocked" }]}>
        <Button type="button" variant="outline">
          English card
        </Button>
      </TooltipCard>
    </div>
  )
}
