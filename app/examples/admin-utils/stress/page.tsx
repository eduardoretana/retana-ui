"use client"

import { StressCase } from "@/app/examples/stress-case"
import { slugify } from "@/registry/lib/slug"
import Preview from "../preview"

const long = "a".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Utilidades de admin</h1>
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
        <p className="text-sm">{slugify("") || "—"}</p>
        <p className="text-sm">{slugify("Horno")}</p>
        <p className="break-all text-sm">{slugify(long)}</p>
        <p className="break-all text-sm">{long}</p>
      </StressCase>
    </main>
  )
}
