"use client"

import { useRef } from "react"

import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { ScrollLinked, type ScrollLinkedPreset } from "@/registry/ui/scroll-linked"

const presets: { preset: ScrollLinkedPreset; title: string; body: string }[] = [
  { preset: "fade", title: "Fade", body: "La nota aparece según el avance, sin desplazarse." },
  { preset: "rise", title: "Subida", body: "Sube un rem y llega a su sitio a mitad de camino." },
  { preset: "scale", title: "Escala", body: "Crece apenas mientras cruza el recuadro." },
  { preset: "rotate", title: "Giro", body: "Parte girada y se endereza con el scroll." },
]

export function Demo() {
  const scroller = useRef<HTMLDivElement>(null)
  return (
    <div ref={scroller} className="h-80 overflow-y-auto rounded-xl border border-border">
      <div className="h-40" />
      <div className="flex flex-col gap-6 px-4">
        {presets.map((item) => (
          <ScrollLinked
            key={item.preset}
            preset={item.preset}
            container={scroller}
            range={item.preset === "rise" ? [0, 0.45] : [0, 1]}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.body}</p>
          </ScrollLinked>
        ))}
      </div>
      <div className="h-40" />
    </div>
  )
}

export function Card({ title, body }: { title: string; body: string }) {
  return (
    <ScrollLinked preset="fade" className="rounded-xl border border-border bg-card p-3">
      <p className="text-sm font-medium [overflow-wrap:anywhere]">{title}</p>
      <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">{body}</p>
    </ScrollLinked>
  )
}

export function StressDemo() {
  return (
    <div className="flex flex-col gap-8">
      <StressCase label="Vacío" width={320}>
        <ScrollLinked preset="fade" className="rounded-xl border border-border p-3">
          <span className="sr-only">Vacío</span>
        </ScrollLinked>
      </StressCase>
      <StressCase label="Una palabra" width={320}>
        <Card title="Cono" body="" />
      </StressCase>
      <StressCase label="Varias frases" width={320}>
        <Card title="Bitácora" body="Secado. Meseta. Bajada. La puerta sigue cerrada hasta los 200 grados." />
      </StressCase>
      <StressCase label="60 sin espacios" width={320}>
        <Card title={unbreakable} body={unbreakable} />
      </StressCase>
      <StressCase label="Emoji y números" width={320}>
        <Card title="🔥 1.250" body="Lote 0042 · 1.280 °C" />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Card title="الفرن" body="ملاحظات الحرق من اليمين إلى اليسار." />
        </div>
      </StressCase>
      <StressCase label="Diez">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }, (_, index) => (
            <Card key={index} title={`Pieza ${index + 1}`} body="Ceniza" />
          ))}
        </div>
      </StressCase>
      <StressCase label="Flex apretado">
        <div className="flex max-w-xl gap-3">
          <div className="h-16 w-16 shrink-0 rounded-lg bg-muted" />
          <div className="min-w-0 flex-1">
            <Card title="Panel" body="El efecto comparte la fila con un hermano." />
          </div>
        </div>
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[72rem] max-w-full">
          <Card title="Ancho" body="El rango sigue siendo un tramo del scroll." />
        </div>
      </StressCase>
    </div>
  )
}
