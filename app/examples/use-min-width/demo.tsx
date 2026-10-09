"use client"

import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { useMinWidth } from "@/registry/hooks/use-min-width"

export function Readout({ label, px, note }: { label: string; px: number; note: string }) {
  const matches = useMinWidth(px)
  return (
    <p className="text-sm [overflow-wrap:anywhere]">
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground">
        {" "}
        · {px}px · {matches ? "sí" : "no"} · {note}
      </span>
    </p>
  )
}

export function Demo() {
  return <Readout label="Viewport" px={768} note="El riel y los pasos fijos usan este corte." />
}

export function StressDemo() {
  return (
    <div className="flex flex-col gap-8">
      <StressCase label="Vacío" width={320}>
        <Readout label="" px={0} note="" />
      </StressCase>
      <StressCase label="Una palabra" width={320}>
        <Readout label="Horno" px={320} note="Cono" />
      </StressCase>
      <StressCase label="Varias frases" width={320}>
        <Readout label="Bitácora" px={768} note="Secado. Meseta. Bajada. La puerta sigue cerrada." />
      </StressCase>
      <StressCase label="60 sin espacios" width={320}>
        <Readout label={unbreakable} px={768} note={unbreakable} />
      </StressCase>
      <StressCase label="Emoji y números" width={320}>
        <Readout label="🔥 1.250" px={480} note="Lote 0042" />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Readout label="العرض" px={768} note="من اليمين إلى اليسار." />
        </div>
      </StressCase>
      <StressCase label="Diez cortes">
        <div className="flex flex-col gap-1">
          {Array.from({ length: 10 }, (_, index) => (
            <Readout key={index} label={`Corte ${index + 1}`} px={320 + index * 80} note="px" />
          ))}
        </div>
      </StressCase>
      <StressCase label="Flex apretado">
        <div className="flex max-w-xl gap-3">
          <div className="h-10 w-16 shrink-0 rounded-lg bg-muted" />
          <div className="min-w-0 flex-1">
            <Readout label="Panel" px={768} note="Comparte la fila." />
          </div>
        </div>
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[72rem] max-w-full">
          <Readout label="Ancho" px={1280} note="Sigue siendo el viewport, no este recuadro." />
        </div>
      </StressCase>
    </div>
  )
}
