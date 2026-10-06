"use client"

import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { ParallaxLayers, type ParallaxLayer } from "@/registry/ui/parallax-layers"

export function scene(caption: string): ParallaxLayer[] {
  return [
    {
      id: "sky",
      speed: 0.2,
      decorative: true,
      className: "bg-muted",
      children: <span className="absolute top-6 right-8 size-12 rounded-full bg-accent" />,
    },
    {
      id: "far",
      depth: 0.45,
      decorative: true,
      children: <span className="absolute inset-x-0 bottom-16 h-20 rounded-t-[2rem] bg-secondary" />,
    },
    {
      id: "near",
      speed: 0.85,
      children: (
        <span className="absolute inset-x-4 bottom-4 rounded-xl border border-border bg-card px-4 py-3 text-sm [overflow-wrap:anywhere]">
          {caption}
        </span>
      ),
    },
  ]
}

export function Demo() {
  return <ParallaxLayers label="Costa al atardecer" className="h-72 rounded-xl border border-border" layers={scene("El sol baja más lento que el cerro.")} />
}

export function StressDemo() {
  return (
    <div className="flex flex-col gap-8">
      <StressCase label="Sin capas" width={320}>
        <ParallaxLayers label="Vacío" layers={[]} className="h-24" />
      </StressCase>
      <StressCase label="Una palabra" width={320}>
        <ParallaxLayers label="Horno" layers={scene("Horno")} className="h-36" />
      </StressCase>
      <StressCase label="Varias frases" width={320}>
        <ParallaxLayers label="Costa" layers={scene("El sol baja más lento que el cerro de enfrente.")} className="h-40" />
      </StressCase>
      <StressCase label="60 sin espacios" width={320}>
        <ParallaxLayers label={unbreakable} layers={scene(unbreakable)} className="h-40" />
      </StressCase>
      <StressCase label="Emoji y números" width={320}>
        <ParallaxLayers label="Números" layers={scene("🔥 1.280")} className="h-36" />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <ParallaxLayers label="ساحل" layers={scene("الشمس أبطأ من التلة.")} className="h-36" />
        </div>
      </StressCase>
      <StressCase label="Diez capas" width={320}>
        <ParallaxLayers
          label="Diez"
          className="h-40"
          layers={Array.from({ length: 10 }, (_, index) => ({
            id: `l${index}`,
            speed: index / 10,
            decorative: index < 9,
            children: index === 9 ? <span className="absolute bottom-2 left-2 text-xs">10</span> : <span className="absolute inset-x-0 bg-muted" style={{ bottom: index * 4, height: 8 }} />,
          }))}
        />
      </StressCase>
      <StressCase label="Flex apretado">
        <div className="flex max-w-xl gap-3">
          <div className="w-16 shrink-0 rounded-lg bg-muted" />
          <ParallaxLayers label="Panel" layers={scene("Panel")} className="h-32 min-w-0 flex-1" />
        </div>
      </StressCase>
    </div>
  )
}
