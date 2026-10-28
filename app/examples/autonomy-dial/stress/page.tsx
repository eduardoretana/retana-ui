"use client"

import { StressCase } from "@/app/examples/stress-case"
import { AutonomyDial } from "@/registry/ui/autonomy-dial"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Dial de autonomía</h1>
      <StressCase label="Vacío, carga y error">
        <AutonomyDial />
        <AutonomyDial loading />
        <AutonomyDial error="No se guardó el nivel." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <AutonomyDial
          title={token}
          actions={[
            { id: "a", label: token, detail: token, risk: "destructive" },
            { id: "b", label: "Una", risk: "safe" },
          ]}
          defaultPinned={["a"]}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <AutonomyDial
            title="صلاحيات"
            actions={[{ id: "a", label: "إرسال", detail: token, risk: "guarded" }]}
          />
        </div>
      </StressCase>
      <StressCase label="Diez acciones">
        <AutonomyDial
          actions={Array.from({ length: 10 }, (_, index) => ({
            id: `a${index}`,
            label: index === 0 ? "" : `Acción ${index}`,
            risk: index % 3 === 0 ? ("destructive" as const) : index % 3 === 1 ? ("guarded" as const) : ("safe" as const),
          }))}
        />
      </StressCase>
    </main>
  )
}
