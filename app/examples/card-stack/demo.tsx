"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { people, unbreakable } from "@/app/examples/arc/demo-data"
import { CardStack } from "@/registry/ui/card-stack"

function Face({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex h-full flex-col justify-end p-4">
      <p className="m-0 text-base font-medium">{name}</p>
      <p className="m-0 text-sm text-muted-foreground">{role}</p>
    </div>
  )
}

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <CardStack
        items={people.slice(0, 4)}
        getKey={(person) => person.id}
        getLabel={(person) => person.name}
        renderCard={(person) => <Face name={person.name} role={person.role} />}
        labels={{ left: "Pasar", right: "Quedarse" }}
        outcomes={{ left: "pasó", right: "se quedó" }}
        label="Piezas del taller"
      />
      <StressCases
        empty={<CardStack items={[]} getKey={(item: { id: string }) => item.id} getLabel={() => ""} renderCard={() => null} />}
        long={
          <CardStack
            items={[{ id: "long", name: unbreakable, role: "note" }]}
            getKey={(item) => item.id}
            getLabel={(item) => item.name}
            renderCard={(item) => <Face name={item.name} role={item.role} />}
          />
        }
        crowded={
          <CardStack
            items={people}
            getKey={(person) => person.id}
            getLabel={(person) => person.name}
            renderCard={(person) => <Face name={person.name} role={person.role} />}
          />
        }
      />
    </div>
  )
}
