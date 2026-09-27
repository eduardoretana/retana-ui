"use client"

import { QuestionCard } from "@/registry/ui/question-card"

export default function QuestionCardPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <QuestionCard
        prompt="¿Qué anexo revisamos?"
        submitLabel="Enviar"
        freeTextLabel="Otra respuesta"
        placeholder="Escribe aquí"
        options={[
          { id: "a", label: "Privacidad" },
          { id: "b", label: "Plazos" },
        ]}
      />
    </div>
  )
}
