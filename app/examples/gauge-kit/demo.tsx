"use client"

import { useMemo, useState } from "react"

import {
  Gauge,
  GaugeArc,
  GaugeComposition,
  GaugeControl,
  GaugeHub,
  GaugeNeedle,
  GaugeText,
  GaugeTickLabels,
  GaugeTicks,
  GaugeTrack,
  GaugeValue,
  GaugeZones,
  gaugeTemplates,
  templatePreview,
  type GaugeTemplate,
} from "@/registry/ui/gauge-kit"

const zones = [
  { to: 80, color: "var(--chart-2)" },
  { to: 140, color: "var(--chart-4)" },
  { to: 180, color: "var(--destructive)" },
]

function Speedometer({ value }: { value: number }) {
  return (
    <Gauge value={value} min={0} max={180} startAngle={40} endAngle={320} label="Velocidad del transbordador" transition>
      <GaugeTrack width={16} />
      <GaugeZones zones={zones} width={16} />
      <GaugeArc width={16} color="var(--primary)" />
      <GaugeTicks count={9} />
      <GaugeTickLabels count={4} />
      <GaugeNeedle style="pointer" />
      <GaugeHub />
      <GaugeValue decimals={0} />
      <GaugeText y={48} fontSize={18} color="var(--muted-foreground)">
        km/h
      </GaugeText>
    </Gauge>
  )
}

function TemplateCard({ template }: { template: GaugeTemplate }) {
  const preview = useMemo(() => templatePreview(template), [template])
  const [value, setValue] = useState(preview.value)
  const { spec } = preview
  const dial = (
    <GaugeComposition spec={spec} value={value} label={template.name} className="h-full w-full" />
  )
  return (
    <figure className="flex min-w-0 flex-col gap-2 rounded-xl border bg-card p-3 text-card-foreground">
      <div className="mx-auto aspect-square w-full max-w-64">
        {spec.control ? (
          <GaugeControl
            value={value}
            onChange={setValue}
            min={spec.domain.min}
            max={spec.domain.max}
            step={spec.control.step}
            startAngle={spec.domain.startAngle}
            endAngle={spec.domain.endAngle}
            label={template.name}
            knob={spec.control.knob}
          >
            {dial}
          </GaugeControl>
        ) : (
          dial
        )}
      </div>
      <figcaption className="truncate text-sm font-medium">{template.name}</figcaption>
      {spec.control ? null : (
        <input
          type="range"
          className="w-full accent-current"
          min={spec.domain.min}
          max={spec.domain.max}
          step={Math.max((spec.domain.max - spec.domain.min) / 200, 0.01)}
          value={value}
          aria-label={`${template.name} valor`}
          onChange={(event) => setValue(Number(event.target.value))}
        />
      )}
    </figure>
  )
}

export function Demo() {
  const [speed, setSpeed] = useState(86)
  const [dim, setDim] = useState(42)
  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-6 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="aspect-square w-full max-w-xs">
            <Speedometer value={speed} />
          </div>
          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Velocidad
            <input
              type="range"
              min={0}
              max={180}
              value={speed}
              className="accent-current"
              onChange={(event) => setSpeed(Number(event.target.value))}
            />
          </label>
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <GaugeControl
            value={dim}
            onChange={setDim}
            min={0}
            max={100}
            step={1}
            label="Luz del taller"
            knob
            valueText={`${dim}%`}
            className="w-full max-w-xs"
          >
            <Gauge value={dim} min={0} max={100} startAngle={40} endAngle={320} label="Luz del taller" transition>
              <GaugeTrack width={22} />
              <GaugeArc width={22} />
              <GaugeHub radius={18} />
              <GaugeValue decimals={0} />
              <GaugeText y={46} fontSize={16} color="var(--muted-foreground)">
                %
              </GaugeText>
            </Gauge>
          </GaugeControl>
          <p className="text-sm text-muted-foreground">Arrastra el aro o usa las flechas.</p>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {gaugeTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </section>
    </div>
  )
}
