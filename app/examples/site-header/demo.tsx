"use client"

import { useRef, useState } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, unbreakable } from "@/app/examples/arc/demo-data"
import { SiteHeader, type SiteHeaderItem, type SiteHeaderVariant } from "@/registry/blocks/site-header"
import { cn } from "@/lib/utils"

const items: SiteHeaderItem[] = [
  {
    value: "trabajo",
    label: "Trabajo",
    links: [
      { label: "Cuencos", description: "Gres de todos los días" },
      { label: "Juegos", description: "Para la mesa de la galería" },
      { label: "Archivo", description: "Hornadas anteriores" },
      { label: "Talleres", description: "Sábados en el banco" },
    ],
    feature: { title: "Hornada del viernes", description: `${atelier.kiln} ya está cargado.` },
  },
  {
    value: "visita",
    label: "Visita",
    links: [
      { label: "Taller", description: `${atelier.city}, con cita` },
      { label: "Galería", description: "Lo que hay en el estante" },
      { label: "Notas", description: "Desde el banco" },
      { label: "Envíos", description: "Cómo viaja una pieza" },
    ],
  },
  { value: "horno", label: "Horno" },
  { value: "diario", label: "Diario" },
]

const options: { value: SiteHeaderVariant; label: string }[] = [
  { value: "mega", label: "Paneles" },
  { value: "simple", label: "Simple" },
  { value: "centered", label: "Centrada" },
]

export function Demo() {
  const [variant, setVariant] = useState<SiteHeaderVariant>("mega")
  const scrollRef = useRef<HTMLDivElement>(null)
  return (
    <div className="flex flex-col gap-8">
      <div role="group" aria-label="Variante de cabecera" className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button key={option.value} type="button" aria-pressed={variant === option.value} className={cn("rounded-lg border px-3 py-1 text-sm", variant === option.value ? "border-border bg-muted text-foreground" : "border-transparent text-muted-foreground")} onClick={() => setVariant(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
      <div ref={scrollRef} className="relative h-[28rem] overflow-y-auto rounded-xl border border-border">
        <SiteHeader
          variant={variant}
          brand={{ name: atelier.name }}
          items={items}
          label="Principal"
          scrollContainer={scrollRef}
          secondaryAction={{ label: "Entrar" }}
          primaryAction={{ label: "Escribir" }}
        />
        <div className="grid gap-3 p-6 pt-24">
          <p className="text-sm text-muted-foreground">Baja para ver la barra sólida. En estrecho, abre el menú.</p>
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="h-16 rounded-lg bg-muted" />)}
        </div>
      </div>
      <StressCases
        empty={<SiteHeader items={[]} brand={{ name: atelier.name }} secondaryAction={null} primaryAction={null} />}
        long={<SiteHeader brand={{ name: unbreakable }} items={[{ value: "largo", label: unbreakable }]} />}
        crowded={<SiteHeader items={Array.from({ length: 10 }, (_, index) => ({ value: `n-${index}`, label: `Pieza ${index + 1}` }))} variant="simple" />}
      />
    </div>
  )
}
