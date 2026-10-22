"use client"

import { StressCase } from "@/app/examples/stress-case"
import { Demo } from "../demo"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Dashboard analítico AE</h1>
      <StressCase label="320px" width={320}>
        <Demo />
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[1280px] max-w-none">
          <Demo />
        </div>
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <Demo />
        </div>
      </StressCase>
    </main>
  )
}
