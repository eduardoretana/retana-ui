"use client"

import { useState } from "react"

import { StressCase } from "@/app/examples/stress-case"
import { ColorPicker, ColorPickerPopover, colorPickerLabelsEs, type HsvaColor } from "@/registry/ui/color-picker"

import { glazes } from "../fixtures"

const many: HsvaColor[] = Array.from({ length: 50 }, (_, index) => ({ h: (index * 37) % 360, s: 0.4 + (index % 5) * 0.12, v: 0.5 + (index % 4) * 0.12, a: 1 }))

function Managed({ initial, max }: { initial: HsvaColor[]; max?: number }) {
  const [saved, setSaved] = useState(initial)
  return <ColorPicker labels={colorPickerLabelsEs} swatches={saved} onSwatchesChange={setSaved} maxSwatches={max} className="w-full" />
}

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Selector de color</h1>
      <StressCase label="320px · 0 guardados" width={320}>
        <Managed initial={[]} />
      </StressCase>
      <StressCase label="320px · 1 guardado" width={320}>
        <Managed initial={glazes.slice(0, 1)} />
      </StressCase>
      <StressCase label="320px · 5 guardados (realista)" width={320}>
        <Managed initial={glazes} />
      </StressCase>
      <StressCase label="320px · 50 guardados (10×)" width={320}>
        <Managed initial={many} max={60} />
      </StressCase>
      <StressCase label="Apretado por un hermano en un flex">
        <div className="flex w-[360px] gap-3">
          <ColorPicker labels={colorPickerLabelsEs} className="min-w-0 flex-1" />
          <p className="w-32 shrink-0 text-sm text-muted-foreground">Texto al lado del selector que ocupa espacio.</p>
        </div>
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <ColorPicker labels={colorPickerLabelsEs} className="w-full" />
        </div>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Managed initial={glazes} />
        </div>
      </StressCase>
      <StressCase label="Popover · 320px" width={320}>
        <ColorPickerPopover labels={colorPickerLabelsEs} defaultFormat="hsl" defaultValue={{ h: 210, s: 0.08, v: 0.42, a: 0.6 }} />
      </StressCase>
      <StressCase label="Un solo formato (sin selector de formato)" width={320}>
        <ColorPicker labels={colorPickerLabelsEs} formats={["hex"]} eyedropper="hidden" className="w-full" />
      </StressCase>
    </main>
  )
}
