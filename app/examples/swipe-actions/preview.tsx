"use client"

import { Archive, Trash2 } from "lucide-react"

import { SwipeActions, SwipeActionsRow } from "@/registry/ui/swipe-actions"

export default function SwipeActionsPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <SwipeActions label="Bandeja" className="w-full">
        <SwipeActionsRow
          label="Nota del horno"
          trailing={[
            { label: "Archivar", icon: <Archive />, keepRow: true, onSelect: () => {} },
            { label: "Borrar", icon: <Trash2 />, tone: "danger", onSelect: () => {} },
          ]}
        >
          <p className="truncate text-sm font-medium">Nota del horno</p>
        </SwipeActionsRow>
      </SwipeActions>
    </div>
  )
}
