"use client"

import { StressCase } from "@/app/examples/stress-case"
import { AppRail } from "@/registry/ui/app-rail"

const token = "N".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Riel</h1>
      <StressCase label="Vacío"><AppRail label="Espacios" status="empty" /></StressCase>
      <StressCase label="Carga y error"><AppRail label="Espacios" status="loading" /><AppRail label="Espacios" status="error" error="No se pudo leer el riel." /></StressCase>
      <StressCase label="Diez destinos" width={80}>
        <AppRail label="Espacios" items={Array.from({ length: 10 }, (_, index) => ({ id: `i${index}`, label: index === 0 ? token : `Destino ${index}`, active: index === 3 }))} />
      </StressCase>
      <StressCase label="RTL" width={80}><div dir="rtl"><AppRail label="شريط" items={[{ id: "a", label: "رسائل", active: true }]} /></div></StressCase>
    </main>
  )
}
