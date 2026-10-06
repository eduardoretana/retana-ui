"use client"

import { useRef } from "react"

import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { ScrollProgress } from "@/registry/ui/scroll-progress"

const notes = [
  "El horno 2 sube a cono 6. La curva se anota cada veinte minutos.",
  "La primera meseta seca el cuerpo. La segunda funde el esmalte de ceniza.",
  "La puerta sigue cerrada hasta que el pirómetro marca 200.",
  "Inés firma la bitácora. Mateo anota el lote de feldespato.",
  "El cono empieza a doblar a la hora prevista. Nadie abre la mirilla.",
  "El final del texto es el final del rango.",
]

export function Demo() {
  return <Article label="Lectura del horno" paragraphs={notes} />
}

export function Article({ label, paragraphs }: { label: string; paragraphs: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div ref={ref} className="h-64 max-w-full overflow-y-auto rounded-xl border border-border">
      <ScrollProgress container={ref} label={label} showValue />
      <article className="flex flex-col gap-4 p-4 text-sm leading-6">
        {paragraphs.length === 0 ? <p className="text-muted-foreground">Sin notas.</p> : null}
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="[overflow-wrap:anywhere]">{paragraph}</p>
        ))}
      </article>
    </div>
  )
}

export function StressDemo() {
  return (
    <div className="flex flex-col gap-8">
      <StressCase label="Vacío" width={320}>
        <Article label="Vacío" paragraphs={[]} />
      </StressCase>
      <StressCase label="Una palabra" width={320}>
        <Article label="Horno" paragraphs={["Cono"]} />
      </StressCase>
      <StressCase label="Varias frases" width={320}>
        <Article label="Bitácora" paragraphs={notes} />
      </StressCase>
      <StressCase label="60 sin espacios" width={320}>
        <Article label={unbreakable} paragraphs={[unbreakable]} />
      </StressCase>
      <StressCase label="Emoji y números" width={320}>
        <Article label="🔥 Lote" paragraphs={["1.280 °C", "0042"]} />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Article label="قراءة" paragraphs={["ملاحظات الحرق.", "الدرجة ١٢٠٠."]} />
        </div>
      </StressCase>
      <StressCase label="Flex apretado">
        <div className="flex max-w-xl gap-3">
          <div className="h-64 w-16 shrink-0 rounded-lg bg-muted" />
          <div className="min-w-0 flex-1">
            <Article label="Panel" paragraphs={notes.slice(0, 3)} />
          </div>
        </div>
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[72rem] max-w-full">
          <Article label="Ancho" paragraphs={notes} />
        </div>
      </StressCase>
    </div>
  )
}
