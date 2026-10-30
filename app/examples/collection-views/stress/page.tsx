"use client"

import { StressCase } from "@/app/examples/stress-case"
import { CollectionViews } from "@/registry/ui/collection-views"

const token = "N".repeat(60)

const one = {
  items: [{ id: "a", groupId: "g", title: "Jarrón", detail: "Pedido de la casa León. Sale el viernes.", start: "2026-10-20", end: "2026-10-30" }],
  groups: [{ id: "g", label: "Banco" }],
}

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Vistas de colección</h1>
      <StressCase label="Vacío, carga y error">
        <CollectionViews title="Vacío" />
        <CollectionViews title="Carga" loading />
        <CollectionViews title="Error" error="No se cargó la colección." onRetry={() => undefined} />
      </StressCase>
      <StressCase label="Una palabra, varias frases y un emoji" width={360}>
        <CollectionViews
          groups={[{ id: "g", label: "Banco" }]}
          items={[
            { id: "a", groupId: "g", title: "Hola" },
            { id: "b", groupId: "g", title: "🏺", detail: "El esmalte espera. El empaque está en la mesa. La nota sale el viernes." },
          ]}
        />
      </StressCase>
      <StressCase label="320px y 60 caracteres" width={320}>
        <CollectionViews items={[{ id: "a", groupId: "g", title: token, detail: token }]} groups={[{ id: "g", label: token }]} />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <CollectionViews
            defaultView="list"
            items={[{ id: "a", groupId: "g", title: "مزهرية", detail: token, people: [{ id: "p", name: "نور" }] }]}
            groups={[{ id: "g", label: "الفرن" }]}
          />
        </div>
      </StressCase>
      <StressCase label="Números" width={480}>
        <CollectionViews
          defaultView="timeline"
          today="2026-10-30"
          items={[{ id: "a", groupId: "g", title: "Pedido 1048", detail: "$18,400.00", start: "2026-10-01", end: "2026-10-30" }]}
          groups={[{ id: "g", label: "1" }]}
        />
      </StressCase>
      <StressCase label="Diez elementos">
        <CollectionViews
          groups={[
            { id: "a", label: "Banco" },
            { id: "b", label: "Horno" },
          ]}
          items={Array.from({ length: 10 }, (_, index) => ({
            id: `t${index}`,
            groupId: index % 2 === 0 ? "a" : "b",
            title: index === 0 ? "" : `Pieza ${index}`,
            start: "2026-10-20",
            end: "2026-11-02",
          }))}
        />
      </StressCase>
      <StressCase label="Apretado por un hermano" width={640}>
        <div className="flex min-w-0 gap-3">
          <div className="w-40 shrink-0 text-sm text-muted-foreground">Hermano</div>
          <div className="min-w-0 flex-1">
            <CollectionViews {...one} />
          </div>
        </div>
      </StressCase>
      <StressCase label="Muy ancho">
        <CollectionViews {...one} defaultView="list" />
      </StressCase>
    </main>
  )
}
