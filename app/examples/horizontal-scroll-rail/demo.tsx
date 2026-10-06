"use client"

import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { HorizontalScrollRail } from "@/registry/ui/horizontal-scroll-rail"

const pieces = [
  { id: "bowl", title: "Cuenco de ceniza", meta: "Cono 6" },
  { id: "jar", title: "Jarra de sal", meta: "Cono 10" },
  { id: "cup", title: "Taza de taller", meta: "Cono 6" },
  { id: "plate", title: "Plato ovalado", meta: "Cono 7" },
  { id: "vase", title: "Florero corto", meta: "Cono 6" },
]

export function Card({ title, meta }: { title: string; meta?: string }) {
  return (
    <article tabIndex={0} className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-medium [overflow-wrap:anywhere]">{title}</h3>
      {meta ? <p className="text-xs text-muted-foreground [overflow-wrap:anywhere]">{meta}</p> : null}
    </article>
  )
}

export function Demo() {
  return (
    <HorizontalScrollRail label="Piezas en el horno" paneClassName="h-44">
      {pieces.map((piece) => (
        <Card key={piece.id} title={piece.title} meta={piece.meta} />
      ))}
    </HorizontalScrollRail>
  )
}

export function Rail({ label, titles }: { label: string; titles: string[] }) {
  return (
    <HorizontalScrollRail label={label} paneClassName="h-28" itemClassName="w-40">
      {titles.map((title, index) => (
        <Card key={`${title}-${index}`} title={title} />
      ))}
    </HorizontalScrollRail>
  )
}

export function StressDemo() {
  return (
    <div className="flex flex-col gap-8">
      <StressCase label="Cantidad 0" width={320}>
        <Rail label="Vacío" titles={[]} />
      </StressCase>
      <StressCase label="Una palabra" width={320}>
        <Rail label="Uno" titles={["Horno"]} />
      </StressCase>
      <StressCase label="Varias frases" width={320}>
        <Rail label="Piezas" titles={pieces.map((piece) => piece.title)} />
      </StressCase>
      <StressCase label="60 sin espacios" width={320}>
        <Rail label="Largo" titles={[unbreakable]} />
      </StressCase>
      <StressCase label="Emoji y números" width={320}>
        <Rail label="Números" titles={["🔥", "1.280", "0042"]} />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Rail label="قطع" titles={["وعاء", "إبريق"]} />
        </div>
      </StressCase>
      <StressCase label="Diez" width={320}>
        <Rail label="Diez" titles={Array.from({ length: 10 }, (_, index) => `Pieza ${index + 1}`)} />
      </StressCase>
      <StressCase label="Flex apretado">
        <div className="flex max-w-xl gap-3">
          <div className="w-16 shrink-0 rounded-lg bg-muted" />
          <div className="min-w-0 flex-1">
            <Rail label="Panel" titles={["Cuenco", "Jarra", "Taza"]} />
          </div>
        </div>
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[72rem] max-w-full">
          <Rail label="Ancho" titles={pieces.map((piece) => piece.title)} />
        </div>
      </StressCase>
    </div>
  )
}
