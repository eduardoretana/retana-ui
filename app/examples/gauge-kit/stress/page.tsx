"use client"

import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { ThemeToggle } from "@/components/demo/theme-toggle"
import {
  Gauge,
  GaugeArc,
  GaugeComposition,
  GaugeControl,
  GaugeTrack,
  GaugeValue,
  gaugeTemplates,
  templatePreview,
} from "@/registry/ui/gauge-kit"

function Dial({
  value,
  label,
}: {
  value: number
  label: string
}) {
  return (
    <Gauge value={value} min={0} max={100} label={label} className="w-full">
      <GaugeTrack />
      <GaugeArc />
      <GaugeValue />
    </Gauge>
  )
}

export default function StressPage() {
  const many = gaugeTemplates.slice(0, 10)
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · medidor componible</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            320px, vacío, uno, diez plantillas, nombre sin espacios, RTL y un control deshabilitado.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="320px" width={320}>
        <Dial value={64} label="Carga del horno" />
      </StressCase>
      <StressCase label="Vacío" width={320}>
        <Dial value={0} label="Sin lectura" />
      </StressCase>
      <StressCase label="Uno">
        <Dial value={1} label="Una unidad" />
      </StressCase>
      <StressCase label="Diez" width={320}>
        <div className="grid grid-cols-2 gap-2">
          {many.map((template) => {
            const { spec, value } = templatePreview(template)
            return <GaugeComposition key={template.id} spec={spec} value={value} label={template.name} />
          })}
        </div>
      </StressCase>
      <StressCase label="Nombre largo" width={320}>
        <Dial value={40} label={unbreakable} />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Dial value={28} label="سرعة العبارة" />
        </div>
      </StressCase>
      <StressCase label="Deshabilitado" width={320}>
        <GaugeControl value={20} onChange={() => {}} label="Perilla bloqueada" disabled>
          <Dial value={20} label="Perilla bloqueada" />
        </GaugeControl>
      </StressCase>
      <StressCase label="Hermano en flex" width={320}>
        <div className="flex items-center gap-2">
          <span className="text-sm">Nota</span>
          <div className="min-w-0 flex-1">
            <Dial value={55} label="Compartido" />
          </div>
        </div>
      </StressCase>
    </main>
  )
}
