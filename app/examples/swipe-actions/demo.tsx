"use client"

import { useState } from "react"
import { Archive, Mail, Trash2 } from "lucide-react"

import { people, unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { SwipeActions, SwipeActionsRow } from "@/registry/ui/swipe-actions"

const seed = ["Nota del horno", "Prueba de esmalte", "Pedido de galería"]

export function Demo() {
  const [rows, setRows] = useState(seed)
  return (
    <div className="flex flex-col gap-8">
      <SwipeActions label="Bandeja del taller" className="max-w-md">
        {rows.map((row) => (
          <SwipeActionsRow
            key={row}
            label={row}
            leading={[{ label: "No leída", icon: <Mail />, tone: "accent", keepRow: true, onSelect: () => {} }]}
            trailing={[
              { label: "Archivar", icon: <Archive />, keepRow: true, onSelect: () => {} },
              { label: "Borrar", icon: <Trash2 />, tone: "danger", onSelect: () => setRows((current) => current.filter((item) => item !== row)) },
            ]}
          >
            <p className="truncate text-sm font-medium">{row}</p>
            <p className="truncate text-xs text-muted-foreground">Costa Atelier · Oaxaca</p>
          </SwipeActionsRow>
        ))}
      </SwipeActions>
      <StressCases
        empty={
          <SwipeActions label="Vacía">
            <SwipeActionsRow label="Vacía" trailing={[{ label: "Archivar", icon: <Archive />, onSelect: () => {} }]}>
              <span className="text-sm text-muted-foreground">Sin notas</span>
            </SwipeActionsRow>
          </SwipeActions>
        }
        long={
          <SwipeActions label="Larga">
            <SwipeActionsRow label={unbreakable} trailing={[{ label: "Archivar", icon: <Archive />, keepRow: true, onSelect: () => {} }]}>
              <p className="truncate text-sm">{unbreakable}</p>
            </SwipeActionsRow>
          </SwipeActions>
        }
        crowded={
          <SwipeActions label="Diez">
            {people.map((person) => (
              <SwipeActionsRow key={person.id} label={person.name} trailing={[{ label: "Archivar", icon: <Archive />, keepRow: true, onSelect: () => {} }]}>
                <p className="truncate text-sm">{person.name}</p>
              </SwipeActionsRow>
            ))}
          </SwipeActions>
        }
      />
    </div>
  )
}
