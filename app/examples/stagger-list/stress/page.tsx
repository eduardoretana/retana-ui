"use client"

import { StressCase } from "@/app/examples/stress-case"
import { StaggerList } from "@/registry/ui/stagger-list"

const token = "G".repeat(60)

const many = Array.from({ length: 40 }, (_, index) => ({
  id: `row-${index}`,
  label: index === 0 ? token : `Fila ${index + 1}`,
}))

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Lista escalonada</h1>
      <StressCase label="320px" width={320}>
        <StaggerList items={[{ id: "one", label: token }]} label="Una">
          {(item) => <p className="rounded-lg bg-muted px-3 py-2 text-sm wrap-anywhere">{item.label}</p>}
        </StaggerList>
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <StaggerList items={many} label="Cuarenta">
            {(item) => <p className="text-sm wrap-anywhere">{item.label}</p>}
          </StaggerList>
        </div>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <StaggerList items={[{ id: "rtl", label: "فرن" }]} label="جدول">
            {(item) => <p className="rounded-lg bg-muted px-3 py-2 text-sm">{item.label}</p>}
          </StaggerList>
        </div>
      </StressCase>
      <StressCase label="Vacío, una palabra y diez veces más">
        <StaggerList items={[]} empty="Vacío" label="Vacío">
          {() => null}
        </StaggerList>
        <StaggerList items={[{ id: "word", label: "Horno" }]} label="Una">
          {(item) => <p className="text-sm">{item.label}</p>}
        </StaggerList>
        <StaggerList items={many.slice(0, 10)} label="Diez">
          {(item) => <p className="text-sm wrap-anywhere">{item.label}</p>}
        </StaggerList>
      </StressCase>
    </main>
  )
}
