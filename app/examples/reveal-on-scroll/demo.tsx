"use client"

import { useState } from "react"

import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { RevealOnScroll, type RevealVariant } from "@/registry/ui/reveal-on-scroll"

const variants: RevealVariant[] = ["fade", "slide", "scale"]

export function Card({ title, body }: { title: string; body: string }) {
  return (
    <RevealOnScroll className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-medium [overflow-wrap:anywhere]">{title}</p>
      <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">{body}</p>
    </RevealOnScroll>
  )
}

export function Demo() {
  const [key, setKey] = useState(0)
  return (
    <div className="flex flex-col gap-4">
      <button type="button" className="self-start rounded-md border border-border px-3 py-1 text-sm" onClick={() => setKey((value) => value + 1)}>
        Repetir entrada
      </button>
      <div key={key} className="flex flex-col gap-3">
        {variants.map((variant) => (
          <RevealOnScroll key={variant} variant={variant} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium">{variant}</p>
            <p className="text-sm text-muted-foreground">Entra al llegar y no se repite.</p>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  )
}

export function StressDemo() {
  return (
    <div className="flex flex-col gap-8">
      <StressCase label="Vacío" width={320}>
        <Card title="" body="" />
      </StressCase>
      <StressCase label="Una palabra" width={320}>
        <Card title="Horno" body="" />
      </StressCase>
      <StressCase label="Varias frases" width={320}>
        <Card title="Bitácora" body="Secado, meseta y bajada. La puerta espera a los 200." />
      </StressCase>
      <StressCase label="60 sin espacios" width={320}>
        <Card title={unbreakable} body={unbreakable} />
      </StressCase>
      <StressCase label="Emoji y números" width={320}>
        <Card title="🔥 1.280" body="Lote 0042" />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Card title="الفرن" body="ملاحظة من اليمين." />
        </div>
      </StressCase>
      <StressCase label="Diez" width={320}>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }, (_, index) => (
            <Card key={index} title={`Nota ${index + 1}`} body="Fila" />
          ))}
        </div>
      </StressCase>
      <StressCase label="Flex apretado">
        <div className="flex max-w-xl gap-3">
          <div className="w-16 shrink-0 rounded-lg bg-muted" />
          <div className="min-w-0 flex-1">
            <Card title="Panel" body="Comparte la fila." />
          </div>
        </div>
      </StressCase>
    </div>
  )
}
