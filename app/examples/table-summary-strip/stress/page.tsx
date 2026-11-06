"use client"

import { StressCase } from "@/app/examples/stress-case"
import { TableSummaryStrip } from "@/registry/ui/table-summary-strip"

const token = "Cifra".repeat(12)

const one = [{ id: "one", label: "Serie", value: 1, format: "number" as const, sparkline: [1, 2, 3], sparklineLabel: "Tendencia de Serie" }]

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Franja de cifras de la tabla</h1>
      <StressCase label="Vacío">
        <TableSummaryStrip items={[]} empty="hide" />
        <p className="text-sm text-muted-foreground">Sin cifras, la franja no se muestra.</p>
      </StressCase>
      <StressCase label="Ceros">
        <TableSummaryStrip locale="es-MX" empty="show" items={[{ id: "zero", label: "Series", value: 0, format: "number", sparkline: [0, 0, 0], sparklineLabel: "Tendencia en cero" }]} />
      </StressCase>
      <StressCase label="Una cifra">
        <TableSummaryStrip locale="es-MX" items={one} />
      </StressCase>
      <StressCase label="Diez cifras">
        <TableSummaryStrip
          locale="es-MX"
          items={Array.from({ length: 10 }, (_, index) => ({
            id: `row-${index}`,
            label: index === 0 ? token : `Serie ${index + 1}`,
            value: index,
            format: "number" as const,
          }))}
        />
      </StressCase>
      <StressCase label="60 caracteres, emoji y RTL" width={320}>
        <TableSummaryStrip locale="es-MX" items={[{ id: "long", label: `${token} 📈`, value: 12, format: "number" }]} />
        <div dir="rtl">
          <TableSummaryStrip locale="ar" items={[{ id: "rtl", label: "سلسلة", value: 4, format: "number", sparkline: [1, 3, 2], sparklineLabel: "اتجاه" }]} />
        </div>
      </StressCase>
      <StressCase label="390 px" width={390}>
        <div className="w-[390px] max-w-full">
          <TableSummaryStrip
            locale="es-MX"
            items={[
              { id: "a", label: "Series", value: 4, format: "number", sparkline: [1, 2, 4], sparklineLabel: "Tendencia de series" },
              { id: "b", label: "En curso", value: 1, format: "number" },
              { id: "c", label: "En pausa", value: 1, format: "number" },
              { id: "d", label: "Fallidas", value: 1, format: "number" },
            ]}
          />
        </div>
      </StressCase>
      <StressCase label="Carga y error">
        <TableSummaryStrip loading labels={{ loading: "Cargando cifras" }} items={one} />
        <TableSummaryStrip error="No se pudieron leer las cifras." onRetry={() => {}} labels={{ retry: "Reintentar" }} />
      </StressCase>
      <StressCase label="Slot por ítem">
        <TableSummaryStrip
          locale="es-MX"
          items={one}
          renderItem={(item) => <span className="text-xs text-muted-foreground">{item.label}</span>}
        />
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <TableSummaryStrip locale="en-US" variant="panel" items={one} />
        </div>
      </StressCase>
    </main>
  )
}
