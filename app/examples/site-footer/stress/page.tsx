"use client"

import { StressCase } from "@/app/examples/stress-case"
import * as Piece from "@/registry/blocks/site-footer"
import Preview from "../preview"

const long = "a".repeat(60)

export default function StressPage() {
  const exported = Object.keys(Piece).find((key) => key !== "default") ?? "site-footer"
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Pie del sitio</h1>
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
      <StressCase label="Vacío, una palabra y 60 caracteres">
        <p className="text-sm text-muted-foreground">{exported}</p>
        <p className="text-sm">Horno</p>
        <p className="break-all text-sm">{long}</p>
        <p className="text-sm" dir="rtl">
          مرحبا
        </p>
      </StressCase>
    </main>
  )
}
