"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { ExpandableCard } from "@/registry/ui/expandable-card"

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <ExpandableCard title="Bitácora del horno" description="Cocción del sábado" width={420}>
        <p className="text-sm text-muted-foreground">Cono 6, gres, 1220 grados. Doce piezas de Costa Atelier.</p>
      </ExpandableCard>
      <StressCases
        empty={
          <ExpandableCard title="Vacía" description="">
            <p />
          </ExpandableCard>
        }
        long={
          <ExpandableCard title={unbreakable} description={unbreakable}>
            <p className="text-sm break-all">{unbreakable}</p>
          </ExpandableCard>
        }
        crowded={
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }, (_, index) => (
              <ExpandableCard key={index} title={`Pieza ${index + 1}`} description="Lista para el horno">
                <p className="text-sm">Notas de la pieza {index + 1}.</p>
              </ExpandableCard>
            ))}
          </div>
        }
      />
    </div>
  )
}
