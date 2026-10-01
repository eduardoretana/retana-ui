"use client"

import { useState } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, unbreakable } from "@/app/examples/arc/demo-data"
import { SiteFooter, type SiteFooterColumn, type SiteFooterVariant } from "@/registry/blocks/site-footer"
import { cn } from "@/lib/utils"

const columns: SiteFooterColumn[] = [
  { title: "Trabajo", links: [{ label: "Cuencos" }, { label: "Juegos" }, { label: "Archivo" }, { label: "Precios" }] },
  { title: "Visita", links: [{ label: atelier.city }, { label: "Galería" }, { label: "Diario" }, { label: "Mapa", external: true }] },
  { title: "Taller", links: [{ label: "Acerca" }, { label: "Talleres" }, { label: "Envíos" }, { label: "Contacto" }] },
]

const options: { value: SiteFooterVariant; label: string }[] = [
  { value: "columns", label: "Columnas" },
  { value: "minimal", label: "Mínimo" },
  { value: "logo", label: "Nombre" },
]

export function Demo() {
  const [variant, setVariant] = useState<SiteFooterVariant>("columns")
  return (
    <div className="flex flex-col gap-8">
      <div role="group" aria-label="Variante de pie" className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button key={option.value} type="button" aria-pressed={variant === option.value} className={cn("rounded-lg border px-3 py-1 text-sm", variant === option.value ? "border-border bg-muted text-foreground" : "border-transparent text-muted-foreground")} onClick={() => setVariant(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
      <SiteFooter
        key={variant}
        variant={variant}
        brand={{ name: atelier.name }}
        tagline={`Piezas de ${atelier.city}. ${atelier.kiln}.`}
        columns={columns}
        newsletter={{ title: "Notas del horno", description: "Un correo al mes. Te puedes dar de baja.", placeholder: atelier.email }}
        status={{ label: "El horno va en hora", tone: "success" }}
      />
      <StressCases
        empty={<SiteFooter columns={[]} legal={[]} socials={[]} newsletter={null} status={null} tagline="" brand={{ name: atelier.name }} />}
        long={<SiteFooter tagline={unbreakable} brand={{ name: atelier.name }} newsletter={null} />}
        crowded={
          <SiteFooter
            brand={{ name: atelier.name }}
            newsletter={null}
            columns={[{ title: "Piezas", links: Array.from({ length: 10 }, (_, index) => ({ label: `Pieza ${index + 1}` })) }]}
          />
        }
      />
    </div>
  )
}
