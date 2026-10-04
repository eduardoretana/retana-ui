"use client"

import { StressCase } from "@/app/examples/stress-case"

import Preview from "../preview"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Cajas de detección</h1>
      <StressCase label="320px" width={320}>
        <Preview />
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <Preview />
        </div>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Preview />
        </div>
      </StressCase>
      <StressCase label="Vacío / una palabra">
        <p className="text-sm text-muted-foreground">detection-overlay</p>
      </StressCase>
    </main>
  )
}
