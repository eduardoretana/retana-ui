"use client"

import { Button } from "@/components/ui/button"
import { TooltipCard } from "@/registry/ui/tooltip-card"

const token = "Y".repeat(60)
const rtl = "ملاحظة تجريبية للأرشيف"

const people = Array.from({ length: 8 }, (_, index) => ({ id: `p-${index}`, name: `Persona ${index + 1}` }))

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-10 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tarjeta flotante</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Solo título</h2>
        <TooltipCard title="Una">
          <Button type="button">Una</Button>
        </TooltipCard>
      </section>

      <section className="flex max-w-80 flex-col gap-2">
        <h2 className="text-sm font-medium">Token largo en 320px</h2>
        <TooltipCard title={token} description={token} defaultOpen>
          <Button type="button">Token</Button>
        </TooltipCard>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Emoji y números</h2>
        <TooltipCard title="📦 1.250,00" description="🙂 🙂 🙂" metrics={[{ id: "n", label: "Piezas", value: "100000200000300000" }]}>
          <Button type="button">Números</Button>
        </TooltipCard>
      </section>

      <section className="flex flex-col gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Texto de derecha a izquierda</h2>
        <TooltipCard title={rtl} description={rtl}>
          <Button type="button">RTL</Button>
        </TooltipCard>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Muchas personas y deshabilitada</h2>
        <TooltipCard title="Equipo" people={people} disabled>
          <Button type="button">Sin tarjeta</Button>
        </TooltipCard>
      </section>

      <section className="flex min-w-0 gap-3">
        <h2 className="sr-only">Apretada por un hermano</h2>
        <div className="h-24 w-40 shrink-0 rounded-lg border border-border" />
        <TooltipCard title="Al lado" description="El ancla sigue siendo el botón.">
          <Button type="button">Apretada</Button>
        </TooltipCard>
      </section>
    </main>
  )
}
