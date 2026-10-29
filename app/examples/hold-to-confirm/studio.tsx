"use client"

import * as React from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { HoldToConfirm } from "@/registry/ui/hold-to-confirm"

export function Demo() {
  const [holding, setHolding] = React.useState(false)
  const [done, setDone] = React.useState(false)

  return (
    <div className="flex flex-col items-start gap-8">
      <div className="flex flex-col items-start gap-2">
        <HoldToConfirm
          label={`Hold to retire ${atelier.kiln}`}
          confirmedLabel="Retired"
          confirmed={done}
          onHoldChange={setHolding}
          onConfirm={() => setDone(true)}
        />
        <p className="text-xs text-muted-foreground">
          {done ? "The kiln is retired." : holding ? "Keep holding." : "Hold to confirm."}
        </p>
        {done ? (
          <button type="button" className="text-xs text-muted-foreground underline" onClick={() => setDone(false)}>
            Reset
          </button>
        ) : null}
      </div>
      <HoldToConfirm label={`Archive ${atelier.name}`} tone="neutral" confirmedLabel="Archived" onConfirm={() => {}} />
      <StressCases
        empty={<HoldToConfirm label="" onConfirm={() => {}} />}
        long={<HoldToConfirm label={unbreakable} className="max-w-full" onConfirm={() => {}} />}
        crowded={
          <div className="flex flex-col gap-2">
            {people.map((person) => (
              <HoldToConfirm key={person.id} label={person.name} className="max-w-full" onConfirm={() => {}} />
            ))}
          </div>
        }
      />
    </div>
  )
}
