"use client"

import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { StickySectionList, type StickySection } from "@/registry/ui/sticky-section-list"

export const directory: StickySection[] = [
  {
    id: "a",
    label: "A",
    items: [
      { id: "ana", title: "Ana Solís", detail: "Horno" },
      { id: "aura", title: "Aura Vidal", detail: "Galería" },
    ],
  },
  {
    id: "b",
    label: "B",
    items: [
      { id: "bruno", title: "Bruno Peña", detail: "Esmalte" },
      { id: "belen", title: "Belén Marín", detail: "Empaque" },
    ],
  },
  {
    id: "c",
    label: "C",
    items: [{ id: "cira", title: "Cira Neri", detail: "Cuentas" }],
  },
]

export function Demo() {
  return (
    <div className="h-80 overflow-y-auto rounded-xl border border-border">
      <StickySectionList label="Directorio del taller" sections={directory} />
    </div>
  )
}

export function StressDemo() {
  return (
    <div className="flex flex-col gap-8">
      <StressCase label="Cantidad 0" width={320}>
        <StickySectionList sections={[]} emptyLabel="Sin grupos" />
      </StressCase>
      <StressCase label="Grupo vacío" width={320}>
        <StickySectionList sections={[{ id: "a", label: "A", items: [] }]} emptyLabel="Nadie en este grupo" />
      </StressCase>
      <StressCase label="Una palabra" width={320}>
        <div className="h-40 overflow-y-auto rounded-lg border border-border">
          <StickySectionList sections={[{ id: "h", label: "H", items: [{ id: "1", title: "Horno" }] }]} />
        </div>
      </StressCase>
      <StressCase label="Varias frases" width={320}>
        <div className="h-48 overflow-y-auto rounded-lg border border-border">
          <StickySectionList sections={directory} />
        </div>
      </StressCase>
      <StressCase label="60 sin espacios" width={320}>
        <StickySectionList sections={[{ id: "z", label: unbreakable, items: [{ id: "z", title: unbreakable, detail: unbreakable }] }]} />
      </StressCase>
      <StressCase label="Emoji y números" width={320}>
        <StickySectionList sections={[{ id: "n", label: "🔥", items: [{ id: "n", title: "1.280", detail: "0042" }] }]} />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <StickySectionList sections={[{ id: "ar", label: "أ", items: [{ id: "ar", title: "ليلى", detail: "الفرن" }] }]} />
        </div>
      </StressCase>
      <StressCase label="Diez" width={320}>
        <div className="h-48 overflow-y-auto rounded-lg border border-border">
          <StickySectionList
            sections={Array.from({ length: 10 }, (_, index) => ({
              id: `g${index}`,
              label: String.fromCharCode(65 + index),
              items: [{ id: `i${index}`, title: `Persona ${index + 1}` }],
            }))}
          />
        </div>
      </StressCase>
      <StressCase label="Flex apretado">
        <div className="flex max-w-xl gap-3">
          <div className="w-16 shrink-0 rounded-lg bg-muted" />
          <div className="h-40 min-w-0 flex-1 overflow-y-auto rounded-lg border border-border">
            <StickySectionList sections={directory} />
          </div>
        </div>
      </StressCase>
    </div>
  )
}
