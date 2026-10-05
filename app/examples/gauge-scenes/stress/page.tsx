"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ThemeToggle } from "@/components/demo/theme-toggle"
import { CarDashboard, Cockpit } from "@/registry/blocks/gauge-scenes"
import { Gauge, GaugeArc, GaugeTrack, GaugeValue } from "@/registry/ui/gauge-kit"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · escenas de medidores</h1>
          <p className="mt-2 text-sm text-muted-foreground">320px, un dial vacío, el tablero y la cabina apretados.</p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="320px" width={320}>
        <CarDashboard />
      </StressCase>
      <StressCase label="Vacío" width={320}>
        <Gauge value={0} label="Sin escena" className="w-full">
          <GaugeTrack />
          <GaugeArc />
          <GaugeValue />
        </Gauge>
      </StressCase>
      <StressCase label="Cabina estrecha" width={320}>
        <Cockpit />
      </StressCase>
      <StressCase label="Muy ancho">
        <div className="w-full max-w-5xl">
          <CarDashboard />
        </div>
      </StressCase>
    </main>
  )
}
