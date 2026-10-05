"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ThemeToggle } from "@/components/demo/theme-toggle"
import { GaugeStudio } from "@/registry/blocks/gauge-studio"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · estudio</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            320px, deshacer deshabilitado al inicio, y el estudio junto a un hermano.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="320px" width={320}>
        <GaugeStudio className="max-w-full" />
      </StressCase>
      <StressCase label="Deshabilitado" width={320}>
        <p className="text-sm text-muted-foreground">Deshacer y rehacer empiezan apagados.</p>
        <GaugeStudio />
      </StressCase>
      <StressCase label="Hermano en flex" width={320}>
        <div className="flex items-start gap-2">
          <span className="pt-2 text-sm">Nota</span>
          <div className="min-w-0 flex-1">
            <GaugeStudio />
          </div>
        </div>
      </StressCase>
    </main>
  )
}
