"use client"

import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { Button } from "@/components/ui/button"
import { BottomSheet } from "@/registry/ui/bottom-sheet"

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <BottomSheet
        title="Carga del horno"
        description={`${atelier.city} · ${atelier.kiln}`}
        defaultOpen
        trigger={<Button variant="outline">Abrir hoja</Button>}
      >
        <ul className="grid gap-2">
          {people.slice(0, 6).map((person) => (
            <li key={person.id} className="rounded-lg border border-border px-3 py-2">
              <span className="font-medium">{person.name}</span>
              <span className="text-muted-foreground"> · {person.role}</span>
            </li>
          ))}
        </ul>
      </BottomSheet>
      <StressCases
        empty={
          <BottomSheet title="Vacío" description="Sin piezas" trigger={<Button variant="outline" className="w-full">Vacío</Button>}>
            <p className="text-muted-foreground">Nada en la hoja.</p>
          </BottomSheet>
        }
        long={
          <BottomSheet title="Nota" trigger={<Button variant="outline" className="w-full">Larga</Button>}>
            <p className="wrap-anywhere">{unbreakable}</p>
          </BottomSheet>
        }
        crowded={
          <BottomSheet title="Equipo" trigger={<Button variant="outline" className="w-full">Diez</Button>}>
            <ul className="grid gap-1">
              {people.map((person) => (
                <li key={person.id} className="truncate">{person.name}</li>
              ))}
            </ul>
          </BottomSheet>
        }
      />
    </div>
  )
}
