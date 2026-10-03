"use client"

import { atelier, people, plans, unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { TreeView, type TreeNode } from "@/registry/ui/tree-view"

const studio: TreeNode[] = [
  {
    id: "kiln",
    label: atelier.kiln,
    children: people.slice(0, 3).map((person) => ({ id: person.id, label: `${person.name}.md` })),
  },
  {
    id: "plans",
    label: "Planes",
    children: plans.map((plan) => ({ id: plan.id, label: `${plan.name}.json` })),
  },
]

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <TreeView nodes={studio} defaultExpandedIds={["kiln"]} aria-label="Archivos del taller" />
      <StressCases
        empty={<TreeView nodes={[]} aria-label="Vacío" />}
        long={<TreeView nodes={[{ id: "long", label: unbreakable }]} aria-label="Nombre largo" />}
        crowded={
          <TreeView
            aria-label="Diez archivos"
            nodes={people.map((person) => ({ id: person.id, label: `${person.role}.ts` }))}
          />
        }
      />
    </div>
  )
}
