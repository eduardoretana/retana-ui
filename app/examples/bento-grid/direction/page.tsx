"use client"

import { ExampleFrame } from "@/app/examples/example-frame"
import { BentoCell, BentoGrid } from "@/registry/ui/bento-grid"
import { BentoFeatureCard } from "@/registry/ui/bento-feature-card"

import { filled } from "../fixtures"
import { bentoIcons, BentoSketch } from "../media"

function Variant({ layout }: { layout: "media-first" | "copy-first" }) {
  const copy = filled.es
  const cell = copy.cells[0]!
  return (
    <BentoGrid label="Dirección" columns={2}>
      <BentoCell span={{ col: 1, row: 2 }}>
        <BentoFeatureCard
          layout={layout}
          title={cell.title}
          description={cell.description}
          cta={cell.cta}
          href={cell.href}
          icon={bentoIcons[cell.icon]}
          illustration={<BentoSketch id={cell.id} />}
        />
      </BentoCell>
      <BentoCell span={{ col: 1, row: 1 }}>
        <BentoFeatureCard
          layout={layout}
          title={copy.cells[1]!.title}
          description={copy.cells[1]!.description}
          cta={copy.cells[1]!.cta}
          href={copy.cells[1]!.href}
          icon={bentoIcons[copy.cells[1]!.icon]}
          illustration={<BentoSketch id={copy.cells[1]!.id} />}
        />
      </BentoCell>
    </BentoGrid>
  )
}

export default function DirectionPage() {
  return (
    <ExampleFrame
      title="Dirección de la ilustración"
      description="Dos variantes en código. La elegida es media-first: el dibujo arriba y el texto abajo."
      size="desk"
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">A · media-first</h2>
          <Variant layout="media-first" />
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">B · copy-first</h2>
          <Variant layout="copy-first" />
        </section>
      </div>
    </ExampleFrame>
  )
}
