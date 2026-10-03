"use client"

import { useState } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { SegmentedControl } from "@/registry/ui/segmented-control"
import { HeroSection, type HeroSectionVariant } from "@/registry/blocks/hero-section"

const options: { value: HeroSectionVariant; label: string }[] = [
  { value: "dashboard", label: "Tablero" },
  { value: "workflow", label: "Flujo" },
  { value: "editorial", label: "Editorial" },
]

const copy: Record<HeroSectionVariant, { title: string; description: string }> = {
  dashboard: {
    title: `Las ventas de ${atelier.name}, a la vista`,
    description: `El tablero del taller en ${atelier.city}. Cada pieza y cada pedido.`,
  },
  workflow: {
    title: "Cada pedido, resuelto en el taller",
    description: `${atelier.kiln} avisa, busca la cuenta y guarda el envío.`,
  },
  editorial: {
    title: "La semana, lista antes del lunes",
    description: `El horno, la galería y el taller de ${atelier.city} en una sola página.`,
  },
}

export function Demo() {
  const [variant, setVariant] = useState<HeroSectionVariant>("dashboard")
  const text = copy[variant]
  return (
    <div className="flex flex-col gap-8">
      <SegmentedControl label="Variante de la portada" options={options} value={variant} onValueChange={(value) => setVariant(value as HeroSectionVariant)} />
      <HeroSection
        key={variant}
        variant={variant}
        title={text.title}
        description={text.description}
        primaryAction={{ label: "Reservar un banco", doneLabel: "Reserva lista" }}
        secondaryAction={{ label: "Escribir al taller", href: `mailto:${atelier.email}` }}
        brands={people.slice(0, 6).map((person) => person.name)}
      />
      <StressCases
        empty={<HeroSection plain variant="editorial" title="" description="" primaryAction={null} secondaryAction={null} brands={[]} />}
        long={<HeroSection variant="editorial" title={unbreakable} description={unbreakable} brands={[unbreakable]} animateIn={false} />}
        crowded={<HeroSection variant="editorial" brands={people.map((person) => person.name)} meta={people.map((person) => person.role)} animateIn={false} />}
      />
    </div>
  )
}
