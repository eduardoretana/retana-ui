"use client"

import { useState } from "react"

import { QuestionCard, type QuestionAnswer } from "@/registry/ui/question-card"

export function Demo() {
  const [answer, setAnswer] = useState<QuestionAnswer | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <QuestionCard
        prompt="¿Qué quieres que haga Nube con el contrato de Bruma?"
        mode="multiple"
        submitLabel="Enviar respuesta"
        submittedLabel="Respuesta enviada"
        freeTextLabel="Otra indicación"
        placeholder="Añade un matiz"
        options={[
          { id: "dates", label: "Revisar plazos", description: "Comparar marzo y la versión nueva." },
          { id: "privacy", label: "Marcar privacidad", description: "Solo el anexo, sin reescribirlo." },
          { id: "send", label: "Preparar el correo", description: "Borrador, sin enviar." },
        ]}
        onSubmit={setAnswer}
      />
      {answer ? (
        <p className="text-sm text-muted-foreground">
          Opciones: {answer.optionIds.join(", ") || "ninguna"}
          {answer.text ? ` · Nota: ${answer.text}` : ""}
        </p>
      ) : null}
    </div>
  )
}
