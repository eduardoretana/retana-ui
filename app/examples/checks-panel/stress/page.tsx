"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ChecksPanel, checksPanelLabelsEs, type CheckItem } from "@/registry/ui/checks-panel"

const long = "Y".repeat(60)

const many: CheckItem[] = Array.from({ length: 50 }, (_, index) => ({
  id: `c-${index}`,
  name: index === 3 ? long : `check-${index}`,
  status: index % 7 === 0 ? "failed" : index % 5 === 0 ? "running" : "passed",
  durationMs: 1000 + index * 100,
  progress: index % 5 === 0 ? 0.3 : 1,
  estimated: index % 5 === 0,
}))

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Panel de comprobaciones</h1>
      <StressCase label="390 px y 50 comprobaciones" width={390}>
        <ChecksPanel open passed={40} total={50} sha={long} message={long} checks={many} labels={checksPanelLabelsEs} />
      </StressCase>
      <StressCase label="Vacío y una palabra" width={320}>
        <ChecksPanel passed={0} total={0} sha="a" message="A" checks={[]} labels={checksPanelLabelsEs} defaultOpen />
      </StressCase>
      <StressCase label="RTL" width={390}>
        <div dir="rtl">
          <ChecksPanel
            open
            passed={0}
            total={1}
            sha="abc"
            message="فحص"
            labels={checksPanelLabelsEs}
            checks={[{ id: "rtl", name: "فحص-طويل-جدا", status: "failed", durationMs: 12000, progress: 1 }]}
          />
        </div>
      </StressCase>
    </main>
  )
}
