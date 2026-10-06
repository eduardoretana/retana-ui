"use client"

import { useState } from "react"

import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { StaggerItem, StaggerReveal } from "@/registry/ui/stagger-reveal"

const materials = ["Ceniza de encino", "Feldespato", "Sílice", "Ball clay"]

export function Demo() {
  const [key, setKey] = useState(0)
  return (
    <div className="flex flex-col gap-4">
      <button type="button" className="self-start rounded-md border border-border px-3 py-1 text-sm" onClick={() => setKey((value) => value + 1)}>
        Repetir cascada
      </button>
      <StaggerReveal key={key} as="ul" className="flex flex-col gap-2">
        {materials.map((material) => (
          <StaggerItem as="li" key={material} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
            {material}
          </StaggerItem>
        ))}
      </StaggerReveal>
    </div>
  )
}

export function List({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin piezas.</p>
  }
  return (
    <StaggerReveal as="ul" className="flex min-w-0 flex-col gap-2">
      {items.map((item, index) => (
        <StaggerItem as="li" key={`${item}-${index}`} className="rounded-lg border border-border px-3 py-2 text-sm [overflow-wrap:anywhere]">
          {item}
        </StaggerItem>
      ))}
    </StaggerReveal>
  )
}

export function StressDemo() {
  return (
    <div className="flex flex-col gap-8">
      <StressCase label="Cantidad 0" width={320}>
        <List items={[]} />
      </StressCase>
      <StressCase label="Una palabra" width={320}>
        <List items={["Horno"]} />
      </StressCase>
      <StressCase label="Varias frases" width={320}>
        <List items={["Secado lento.", "Meseta de esmalte.", "Bajada con la puerta cerrada."]} />
      </StressCase>
      <StressCase label="60 sin espacios" width={320}>
        <List items={[unbreakable]} />
      </StressCase>
      <StressCase label="Emoji y números" width={320}>
        <List items={["🔥", "1.280", "0042"]} />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <List items={["رماد", "فلسبار"]} />
        </div>
      </StressCase>
      <StressCase label="Diez" width={320}>
        <List items={Array.from({ length: 10 }, (_, index) => `Lote ${index + 1}`)} />
      </StressCase>
      <StressCase label="Flex apretado">
        <div className="flex max-w-xl gap-3">
          <div className="w-16 shrink-0 rounded-lg bg-muted" />
          <div className="min-w-0 flex-1">
            <List items={materials} />
          </div>
        </div>
      </StressCase>
    </div>
  )
}
