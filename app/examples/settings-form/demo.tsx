"use client"

import { useState } from "react"
import { toast } from "sonner"

import { SettingsForm, type SettingsGroup } from "@/registry/ui/settings-form"

const groups: SettingsGroup[] = [
  {
    id: "home",
    title: "Portada",
    description: "Lo que ve quien llega al sitio.",
    fields: [
      { key: "site.name", label: "Nombre" },
      { key: "site.headline", label: "Titular", kind: "textarea", rows: 2 },
      { key: "cta.label", label: "Botón" },
    ],
  },
  {
    id: "seo",
    title: "Buscadores",
    fields: [{ key: "seo.description", label: "Descripción", kind: "textarea" }],
  },
]

const initial = {
  "site.name": "Estudio Acme",
  "site.headline": "Diseño de producto para equipos pequeños",
  "cta.label": "Reservar una llamada",
  "seo.description": "Estudio ficticio. Correo hola@acme.example.",
}

export function SettingsFormDemo() {
  const [values, setValues] = useState<Record<string, string>>(initial)

  return (
    <main className="mx-auto min-h-dvh max-w-3xl bg-background p-6">
      <SettingsForm
        groups={groups}
        values={values}
        saveLabel="Guardar textos"
        pendingLabel="Guardando…"
        errorLabel="No se pudo guardar"
        discardLabel="Descartar"
        dirtyLabel="Hay cambios sin guardar"
        cleanLabel="Todo guardado"
        leaveMessage="Hay textos sin guardar."
        onSave={async (next) => {
          await new Promise((resolve) => setTimeout(resolve, 250))
          setValues(next)
          toast.success("Textos guardados")
        }}
      />
    </main>
  )
}
