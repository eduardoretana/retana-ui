"use client"

import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { ScrollSnapPanel, ScrollSnapRail } from "@/registry/ui/scroll-snap-rail"

const stages = [
  { id: "01", title: "Secado", body: "La puerta entreabierta hasta que el pie suena seco." },
  { id: "02", title: "Esmalte", body: "Meseta corta. El cono empieza a doblar." },
  { id: "03", title: "Bajada", body: "Sin abrir. El choque térmico parte los bordes." },
]

export function Demo() {
  return (
    <div className="flex flex-col gap-6">
      <ScrollSnapRail label="Etapas del horno" className="h-64 rounded-xl border border-border">
        {stages.map((stage) => (
          <ScrollSnapPanel key={stage.id} className="flex h-full flex-col justify-end p-6">
            <p className="text-4xl font-semibold tabular-nums text-muted-foreground">{stage.id}</p>
            <h2 className="text-lg font-medium">{stage.title}</h2>
            <p className="max-w-sm text-sm text-muted-foreground">{stage.body}</p>
          </ScrollSnapPanel>
        ))}
      </ScrollSnapRail>
      <ScrollSnapRail axis="x" label="Tarjetas" className="rounded-xl border border-border">
        {stages.map((stage) => (
          <ScrollSnapPanel key={stage.id} className="w-4/5 p-4">
            <p className="text-sm font-medium">{stage.title}</p>
            <p className="text-sm text-muted-foreground">{stage.body}</p>
          </ScrollSnapPanel>
        ))}
      </ScrollSnapRail>
    </div>
  )
}

export function Rail({ label, panels }: { label: string; panels: { id: string; title: string }[] }) {
  return (
    <ScrollSnapRail axis="x" label={label} className="h-28 rounded-lg border border-border">
      {panels.map((panel) => (
        <ScrollSnapPanel key={panel.id} className="flex h-full w-4/5 items-center p-3">
          <p className="text-sm [overflow-wrap:anywhere]">{panel.title}</p>
        </ScrollSnapPanel>
      ))}
    </ScrollSnapRail>
  )
}

export function StressDemo() {
  return (
    <div className="flex flex-col gap-8">
      <StressCase label="Cantidad 0" width={320}>
        <Rail label="Vacío" panels={[]} />
      </StressCase>
      <StressCase label="Una palabra" width={320}>
        <Rail label="Uno" panels={[{ id: "1", title: "Horno" }]} />
      </StressCase>
      <StressCase label="Varias frases" width={320}>
        <Rail label="Etapas" panels={stages.map((stage) => ({ id: stage.id, title: `${stage.title}. ${stage.body}` }))} />
      </StressCase>
      <StressCase label="60 sin espacios" width={320}>
        <Rail label={unbreakable} panels={[{ id: "long", title: unbreakable }]} />
      </StressCase>
      <StressCase label="Emoji y números" width={320}>
        <Rail label="Números" panels={[{ id: "e", title: "🔥 1.280" }, { id: "n", title: "0042" }]} />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Rail label="اتجاه" panels={[{ id: "a", title: "تجفيف" }]} />
        </div>
      </StressCase>
      <StressCase label="Diez" width={320}>
        <Rail label="Diez" panels={Array.from({ length: 10 }, (_, index) => ({ id: String(index), title: `Paso ${index + 1}` }))} />
      </StressCase>
      <StressCase label="Flex apretado">
        <div className="flex max-w-xl gap-3">
          <div className="w-16 shrink-0 rounded-lg bg-muted" />
          <div className="min-w-0 flex-1">
            <Rail label="Panel" panels={stages.map((stage) => ({ id: stage.id, title: stage.title }))} />
          </div>
        </div>
      </StressCase>
    </div>
  )
}
