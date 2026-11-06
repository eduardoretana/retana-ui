"use client"

import { StressCase } from "@/app/examples/stress-case"
import { StatusActionCell } from "@/registry/ui/status-action-cell"

const token = "Serie".repeat(12)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Celda de estado y acciones</h1>
      <StressCase label="Vacío">
        <StatusActionCell label="Listo" tone="positive" actions={[]} />
      </StressCase>
      <StressCase label="Una acción">
        <StatusActionCell label="En curso" tone="info" actions={[{ id: "approve", label: "Aprobar", onClick: () => {} }]} />
      </StressCase>
      <StressCase label="Cuatro acciones">
        <StatusActionCell
          label="En pausa"
          tone="warning"
          actions={[
            { id: "resume", label: "Reanudar", onClick: () => {} },
            { id: "retry", label: "Reintentar", onClick: () => {} },
            { id: "approve", label: "Aprobar", onClick: () => {} },
            { id: "note", label: "Anotar", onClick: () => {} },
          ]}
        />
      </StressCase>
      <StressCase label="Diez acciones">
        <StatusActionCell
          label="Falló"
          tone="critical"
          actions={Array.from({ length: 10 }, (_, index) => ({
            id: `action-${index}`,
            label: `Acción ${index + 1}`,
            onClick: () => {},
          }))}
        />
      </StressCase>
      <StressCase label="60 caracteres y emoji" width={320}>
        <StatusActionCell label={token} tone="warning" actions={[{ id: "go", label: "🔁 Reanudar ahora mismo", onClick: () => {} }]} />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <StatusActionCell label="متوقف" tone="warning" menuLabel="إجراءات" moreLabel="المزيد" actions={[{ id: "go", label: "استئناف", onClick: () => {} }]} />
        </div>
      </StressCase>
      <StressCase label="390 px" width={390}>
        <div className="@container w-[390px] max-w-full">
          <StatusActionCell
            label="En pausa"
            tone="warning"
            menuLabel="Acciones"
            actions={[
              { id: "resume", label: "Reanudar", onClick: () => {} },
              { id: "retry", label: "Reintentar", onClick: () => {} },
              { id: "approve", label: "Aprobar", onClick: () => {} },
            ]}
          />
        </div>
      </StressCase>
      <StressCase label="Pendiente y error">
        <StatusActionCell
          label="En pausa"
          tone="warning"
          error="No se pudo reanudar esta serie."
          actions={[{ id: "resume", label: "Reanudar", pending: true, onClick: () => {} }]}
        />
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <StatusActionCell label="En curso" tone="info" density="compact" actions={[{ id: "approve", label: "Aprobar", onClick: () => {} }]} />
        </div>
      </StressCase>
    </main>
  )
}
