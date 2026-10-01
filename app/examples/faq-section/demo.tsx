"use client"

import { useState } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, unbreakable } from "@/app/examples/arc/demo-data"
import { FaqSection, type FaqItem, type FaqSectionVariant } from "@/registry/blocks/faq-section"
import { cn } from "@/lib/utils"

const items: FaqItem[] = [
  { question: "¿Cuánto dura una hornada?", answer: `${atelier.kiln} tarda unas doce horas y se enfría de noche.`, category: "Horno" },
  { question: "¿Se puede visitar el taller?", answer: `Sí, en ${atelier.city}, con cita entre semana.`, category: "Visita" },
  { question: "¿Empacan para enviar?", answer: "Cada pieza sale en doble caja. Si se rompe en el camino, se repone.", category: "Pedidos" },
  { question: "¿Qué barro usan?", answer: "El día a día es gres. La porcelana va en hornadas aparte.", category: "Horno" },
  { question: "¿Cómo es el mayoreo?", answer: "Las tiendas piden por juego. El mínimo son cuatro piezas.", category: "Pedidos" },
  { question: "¿Reparan una pieza?", answer: "Un desconchón en la base se puede lijar. Una grieta en el muro retira la pieza.", category: "Horno" },
  { question: "¿Hacen encargos?", answer: `Escribe a ${atelier.email} con el número de piezas y la fecha.`, category: "Pedidos" },
  { question: "¿Dónde se hacen?", answer: `Todo se tornea y esmalta en ${atelier.city}.`, category: "Visita" },
]

const options: { value: FaqSectionVariant; label: string }[] = [
  { value: "accordion", label: "Acordeón" },
  { value: "columns", label: "Temas" },
  { value: "search", label: "Búsqueda" },
]

export function Demo() {
  const [variant, setVariant] = useState<FaqSectionVariant>("accordion")
  return (
    <div className="flex flex-col gap-8">
      <div role="group" aria-label="Variante de preguntas" className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button key={option.value} type="button" aria-pressed={variant === option.value} className={cn("rounded-lg border px-3 py-1 text-sm", variant === option.value ? "border-border bg-muted text-foreground" : "border-transparent text-muted-foreground")} onClick={() => setVariant(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
      <FaqSection
        key={variant}
        variant={variant}
        title="Preguntas del taller"
        description={`Visitas, hornadas y pedidos de ${atelier.name}.`}
        items={items}
        contact={{ label: "¿Sigue la duda?", description: `Escribe a ${atelier.email}.` }}
      />
      <StressCases
        empty={<FaqSection items={[]} title="Sin preguntas" description="" contact={null} />}
        long={<FaqSection title={unbreakable} items={[{ question: unbreakable, answer: unbreakable }]} contact={null} />}
        crowded={<FaqSection items={Array.from({ length: 10 }, (_, index) => ({ question: `Pregunta ${index + 1} del taller`, answer: `Respuesta ${index + 1} sobre ${atelier.kiln}.` }))} contact={null} />}
      />
    </div>
  )
}
