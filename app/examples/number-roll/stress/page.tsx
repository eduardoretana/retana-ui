"use client"

import { StressCase } from "@/app/examples/stress-case"
import { NumberRoll } from "@/registry/ui/number-roll"

const token = "G".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Rodillo numérico</h1>
      <StressCase label="320px" width={320}>
        <NumberRoll value={18640.5} decimals={2} hierarchy prefix="$" suffix={` ${token}`} locale="es-MX" className="text-2xl" />
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <NumberRoll value={18640.5} decimals={2} hierarchy prefix="$" locale="en-US" className="text-3xl" />
        </div>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <NumberRoll value={18640.5} decimals={2} hierarchy prefix="$" locale="ar" className="text-2xl" />
        </div>
      </StressCase>
      <StressCase label="Vacío, una palabra, negativo y 60 caracteres">
        <NumberRoll value={0} decimals={2} hierarchy prefix="$" locale="es-MX" />
        <NumberRoll value={1} decimals={0} suffix=" horno" locale="es-MX" />
        <NumberRoll value={-1280.5} decimals={2} hierarchy locale="es-MX" />
        <NumberRoll value={999999.99} decimals={2} hierarchy suffix={` ${token}`} locale="en-US" />
      </StressCase>
    </main>
  )
}
