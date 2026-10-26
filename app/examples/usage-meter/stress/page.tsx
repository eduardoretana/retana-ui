"use client"

import { StressCase } from "@/app/examples/stress-case"
import { UsageMeter } from "@/registry/ui/usage-meter"

const token = "G".repeat(60)

const many = Array.from({ length: 10 }, (_, index) => ({
  id: `row-${index}`,
  label: index === 0 ? token : `Fila ${index + 1}`,
  value: index + 1,
}))

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Medidor de uso</h1>
      <StressCase label="320px" width={320}>
        <UsageMeter label={token} limit={100} unit="GB" segments={[{ id: "one", label: token, value: 12 }]} />
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <UsageMeter label="Diez categorías" limit={100} unit="GB" segments={many} />
        </div>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <UsageMeter label="مخزن" limit={10} unit="GB" decimals={0} segments={[{ id: "rtl", label: "خزف", value: 4 }]} />
        </div>
      </StressCase>
      <StressCase label="Vacío, una palabra y 60 caracteres">
        <UsageMeter label="Vacío" segments={[]} limit={100} unit="GB" />
        <UsageMeter label="Horno" limit={100} unit="GB" segments={[{ id: "kiln", label: "Horno", value: 1 }]} />
        <UsageMeter label={token} limit={100} unit="GB" segments={[{ id: "long", label: token, value: 12 }]} />
      </StressCase>
    </main>
  )
}
