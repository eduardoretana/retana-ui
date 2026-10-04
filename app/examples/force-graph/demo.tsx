"use client"

import { ForceGraph } from "@/registry/ui/force-graph"

const nodes = [
  { id: "a", label: "Bowl", type: "object" },
  { id: "b", label: "Shelf", type: "place" },
  { id: "c", label: "Celadon", type: "glaze" },
]
const edges = [
  { source: "a", target: "b", label: "sits on" },
  { source: "a", target: "c", label: "wears" },
]

export function Demo() {
  return (
    <div className="bg-background p-3">
      <ForceGraph nodes={nodes} edges={edges} height={220} />
    </div>
  )
}
