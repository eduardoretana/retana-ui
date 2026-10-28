"use client"

import { StressCase } from "@/app/examples/stress-case"
import { businessSpan, mexicoStatutoryHolidays } from "@/registry/lib/time-off"

const token = "N".repeat(60)

export default function StressPage() {
  const span = businessSpan("2026-09-14", "2026-09-18", mexicoStatutoryHolidays(2026))
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Días hábiles</h1>
      <StressCase label="Vacío">{businessSpan("", "", []).days}</StressCase>
      <StressCase label="Fecha inválida">{businessSpan("no", "2026-01-01", []).days}</StressCase>
      <StressCase label="320px" width={320}>
        <p className="break-words text-sm">{token}</p>
        <p className="text-sm">{span.days}</p>
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">عطلة</div>
      </StressCase>
      <StressCase label="Diez años">
        <ul>
          {Array.from({ length: 10 }, (_, index) => (
            <li key={index}>{mexicoStatutoryHolidays(2020 + index).length}</li>
          ))}
        </ul>
      </StressCase>
    </main>
  )
}
