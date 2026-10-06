"use client"

import { useRef, useState } from "react"
import { useMotionValueEvent } from "motion/react"

import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { clampUnit, useScrollProgress } from "@/registry/hooks/use-scroll-progress"

export function Demo() {
  return <Reader title="Bitácora del horno" body="El horno 2 sube a cono 6. La curva se anota cada veinte minutos, y el progreso del contenedor va de cero a uno." />
}

export function Reader({ title, body }: { title: string; body: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { progress } = useScrollProgress({ container: ref })
  const [value, setValue] = useState(0)
  useMotionValueEvent(progress, "change", (next) => setValue(clampUnit(next)))
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-sm tabular-nums text-muted-foreground">{title}: {value.toFixed(2)}</p>
      <div ref={ref} className="h-36 overflow-y-auto rounded-xl border border-border p-3">
        <p className="text-sm [overflow-wrap:anywhere]">{body}</p>
        <div className="h-40" />
      </div>
    </div>
  )
}

export function StressDemo() {
  return (
    <div className="flex flex-col gap-8">
      <StressCase label="Vacío" width={320}>
        <Reader title="" body="" />
      </StressCase>
      <StressCase label="Una palabra" width={320}>
        <Reader title="Horno" body="Cono" />
      </StressCase>
      <StressCase label="Varias frases" width={320}>
        <Reader title="Bitácora" body="Secado. Meseta. Bajada. La puerta sigue cerrada hasta los 200 grados." />
      </StressCase>
      <StressCase label="60 sin espacios" width={320}>
        <Reader title={unbreakable} body={unbreakable} />
      </StressCase>
      <StressCase label="Emoji y números" width={320}>
        <Reader title="🔥 1.250" body="Lote 0042 · 1.280 °C" />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Reader title="الفرن" body="ملاحظات الحرق من اليمين إلى اليسار." />
        </div>
      </StressCase>
      <StressCase label="Flex apretado">
        <div className="flex w-full max-w-xl gap-3">
          <div className="w-24 shrink-0 rounded-lg bg-muted" />
          <div className="min-w-0 flex-1">
            <Reader title="Panel" body="El riel comparte la fila con un hermano." />
          </div>
        </div>
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[72rem] max-w-full">
          <Reader title="Ancho" body="El valor sigue siendo un número entre 0 y 1." />
        </div>
      </StressCase>
    </div>
  )
}
