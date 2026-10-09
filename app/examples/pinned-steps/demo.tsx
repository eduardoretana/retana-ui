"use client"

import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { PinnedSteps, type PinnedStep } from "@/registry/ui/pinned-steps"

export const kilnSteps: PinnedStep[] = [
  {
    id: "dry",
    title: "Secado",
    body: "La puerta queda entreabierta hasta que el pie suena seco. Nadie apura esta meseta.",
    decorative: true,
    visual: <span className="absolute inset-0 rounded-xl bg-muted" />,
  },
  {
    id: "glaze",
    title: "Esmalte",
    body: "La meseta de ceniza dura doce minutos. El cono empieza a doblar a la hora prevista.",
    visual: (
      <span className="absolute inset-0 flex flex-col justify-end rounded-xl border border-border bg-card p-4">
        <span className="text-xs text-muted-foreground">Pirómetro</span>
        <span className="text-2xl font-semibold tabular-nums">1.220 °C</span>
      </span>
    ),
  },
  {
    id: "cool",
    title: "Bajada",
    body: "La puerta sigue cerrada hasta que el pirómetro marca 200. El choque térmico parte los bordes.",
    visual: (
      <span className="absolute inset-0 flex flex-col justify-end rounded-xl border border-border bg-secondary p-4">
        <span className="text-xs text-muted-foreground">Bitácora</span>
        <span className="text-sm">Inés firma. Mateo anota el feldespato.</span>
      </span>
    ),
  },
]

export function Demo() {
  return <PinnedSteps label="Quema del sábado" steps={kilnSteps} />
}

function shape(id: string, title: string, body: string): PinnedStep {
  return {
    id,
    title,
    body,
    decorative: true,
    visual: <span className="absolute inset-0 rounded-xl bg-muted" />,
  }
}

export function StressDemo() {
  const many = Array.from({ length: 10 }, (_, index) =>
    shape(`n-${index}`, `Paso ${index + 1}`, "Una frase del horno, repetida para ver el ritmo."),
  )
  return (
    <div className="flex flex-col gap-8">
      <StressCase label="Vacío" width={320}>
        <PinnedSteps steps={[]} label="Sin pasos" emptyLabel="Sin pasos" />
      </StressCase>
      <StressCase label="Una palabra" width={320}>
        <PinnedSteps label="Horno" steps={[shape("one", "Cono", "Seco")]} stepClassName="min-h-0" visualClassName="h-24" />
      </StressCase>
      <StressCase label="Varias frases" width={320}>
        <PinnedSteps label="Quema" steps={kilnSteps} stepClassName="min-h-0 py-4" visualClassName="h-28" />
      </StressCase>
      <StressCase label="60 sin espacios" width={320}>
        <PinnedSteps
          label={unbreakable}
          steps={[shape("long", unbreakable, unbreakable)]}
          stepClassName="min-h-0"
          visualClassName="h-24"
        />
      </StressCase>
      <StressCase label="Emoji y números" width={320}>
        <PinnedSteps
          label="🔥 Lote"
          steps={[
            {
              id: "temp",
              title: "🔥 1.250",
              body: "Lote 0042",
              visual: <span className="absolute inset-0 flex items-center justify-center text-sm tabular-nums">0042</span>,
            },
          ]}
          stepClassName="min-h-0"
          visualClassName="h-24"
        />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <PinnedSteps
            label="الفرن"
            steps={[shape("rtl", "تجفيف", "الباب يبقى موارباً حتى يجف القدم.")]}
            stepClassName="min-h-0"
            visualClassName="h-24"
          />
        </div>
      </StressCase>
      <StressCase label="Diez pasos" width={320}>
        <PinnedSteps label="Serie" steps={many} stepClassName="min-h-0 py-3" visualClassName="h-16" />
      </StressCase>
      <StressCase label="Flex apretado">
        <div className="flex max-w-xl gap-3">
          <div className="h-24 w-16 shrink-0 rounded-lg bg-muted" />
          <div className="min-w-0 flex-1">
            <PinnedSteps label="Panel" steps={kilnSteps.slice(0, 1)} stepClassName="min-h-0" visualClassName="h-24" />
          </div>
        </div>
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[72rem] max-w-full">
          <PinnedSteps label="Ancho" steps={kilnSteps} stepClassName="min-h-0 py-6" visualClassName="h-40" />
        </div>
      </StressCase>
    </div>
  )
}
