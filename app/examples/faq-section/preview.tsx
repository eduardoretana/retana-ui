"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { FaqSection } from "@/registry/blocks/faq-section"

export default function FaqSectionPreview() {
  return (
    <div className="bg-background p-3">
      <FaqSection
        title="Preguntas"
        description={atelier.city}
        items={[
          { question: "¿Cuánto dura una hornada?", answer: "Unas doce horas, y el horno se enfría de noche." },
          { question: "¿Se puede visitar?", answer: `Sí, en ${atelier.city}, con cita.` },
        ]}
        contact={null}
      />
    </div>
  )
}
