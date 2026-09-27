"use client"

import { useState } from "react"

import { DissolveInput } from "@/registry/ui/dissolve-input"

export function Demo() {
  const [last, setLast] = useState("Todavía no envías nada.")

  return (
    <div className="flex flex-col gap-3">
      <DissolveInput
        aria-label="Mensaje"
        placeholder="Escribe y pulsa Enter"
        clearLabel="Limpiar"
        defaultValue="El anexo queda para el viernes"
        onDissolve={(value) => setLast(`Se desvaneció: ${value}`)}
      />
      <p className="text-sm text-muted-foreground">{last}</p>
    </div>
  )
}
