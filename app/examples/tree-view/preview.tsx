"use client"

import { atelier, plans } from "@/app/examples/arc/demo-data"
import { TreeView } from "@/registry/ui/tree-view"

export default function TreeViewPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <TreeView
        className="w-full"
        aria-label="Archivos del taller"
        defaultExpandedIds={["kiln"]}
        nodes={[
          {
            id: "kiln",
            label: atelier.kiln,
            children: plans.map((plan) => ({ id: plan.id, label: `${plan.name}.json` })),
          },
        ]}
      />
    </div>
  )
}
