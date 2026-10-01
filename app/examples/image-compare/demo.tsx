"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, unbreakable } from "@/app/examples/arc/demo-data"
import { ImageCompare } from "@/registry/ui/image-compare"

function Plate({ title, tone }: { title: string; tone: "muted" | "primary" }) {
  return (
    <div className={tone === "primary" ? "grid size-full place-items-center bg-primary text-primary-foreground" : "grid size-full place-items-center bg-muted text-foreground"}>
      <span className="px-3 text-sm font-medium">{title}</span>
    </div>
  )
}

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <ImageCompare
        label="Bizcocho y esmalte"
        labels={["Bizcocho", "Esmalte"]}
        before={<Plate title={atelier.kiln} tone="muted" />}
        after={<Plate title={atelier.name} tone="primary" />}
      />
      <StressCases
        empty={<ImageCompare label="Vacío" labels={false} before={<Plate title="" tone="muted" />} after={<Plate title="" tone="primary" />} aspectRatio="2 / 1" />}
        long={<ImageCompare label={unbreakable} labels={[unbreakable, "Después"]} before={<Plate title={unbreakable} tone="muted" />} after={<Plate title="Esmalte" tone="primary" />} aspectRatio="2 / 1" />}
        crowded={
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }, (_, index) => (
              <ImageCompare key={index} label={`Par ${index + 1}`} defaultPosition={20 + index * 6} aspectRatio="5 / 2" before={<Plate title={`Antes ${index + 1}`} tone="muted" />} after={<Plate title={`Después ${index + 1}`} tone="primary" />} />
            ))}
          </div>
        }
      />
    </div>
  )
}
