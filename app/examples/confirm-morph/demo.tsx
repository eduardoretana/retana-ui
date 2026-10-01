"use client"

import { Trash2 } from "lucide-react"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, facetTags, plans, unbreakable } from "@/app/examples/arc/demo-data"
import { ConfirmMorph } from "@/registry/ui/confirm-morph"

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function Demo() {
  return (
    <div className="flex flex-col items-start gap-8">
      <ConfirmMorph
        label="Delete draft"
        icon={<Trash2 />}
        prompt={`Delete ${atelier.kiln}?`}
        onConfirm={() => wait(700)}
        onUndo={() => wait(400)}
      />
      <ConfirmMorph
        label={plans[1].name}
        tone="neutral"
        prompt={`Switch to ${plans[1].name}?`}
        confirmLabel="Switch"
        pendingLabel="Switching"
        doneLabel="Switched"
        onConfirm={() => wait(500)}
      />
      <StressCases
        empty={<ConfirmMorph label="" confirmTimeout={0} resultTimeout={0} />}
        long={<ConfirmMorph label={unbreakable} className="max-w-full" confirmTimeout={0} resultTimeout={0} />}
        crowded={
          <div className="flex flex-col gap-2">
            {facetTags.map((tag) => (
              <ConfirmMorph key={tag} label={tag} className="max-w-full" confirmTimeout={0} resultTimeout={0} />
            ))}
          </div>
        }
      />
    </div>
  )
}
