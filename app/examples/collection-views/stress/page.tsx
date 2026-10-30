"use client"

import { StressCase } from "@/app/examples/stress-case"
import { CollectionViews } from "@/registry/ui/collection-views"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Vistas de colección</h1>
      <StressCase label="Vacío, carga y error">
        <CollectionViews />
        <CollectionViews loading />
        <CollectionViews error="No se cargó la colección." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <CollectionViews
          items={[{ id: "a", groupId: "g", title: token, detail: token }]}
          groups={[{ id: "g", label: token }]}
        />
      </StressCase>
    </main>
  )
}
