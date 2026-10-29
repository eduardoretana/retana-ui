"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, facetTags, people, unbreakable } from "@/app/examples/arc/demo-data"
import { SplitButton } from "@/registry/ui/split-button"

export function Demo() {
  const [copied, setCopied] = React.useState(false)

  return (
    <div className="flex flex-col items-start gap-8">
      <SplitButton
        label={copied ? "Copied" : `Copy ${atelier.email}`}
        icon={copied ? <Check /> : <Copy />}
        onClick={() => setCopied(true)}
        actions={[
          { label: "Copy link", icon: <Copy />, onSelect: () => setCopied(true) },
          { label: "Reset", onSelect: () => setCopied(false) },
          ...people.slice(0, 3).map((person) => ({ label: person.name })),
        ]}
      />
      <SplitButton
        label="Share kiln"
        variant="secondary"
        actions={facetTags.slice(0, 4).map((tag) => ({ label: tag, destructive: tag === "repair" }))}
      />
      <StressCases
        empty={<SplitButton label="" actions={[]} />}
        long={<SplitButton label={unbreakable} className="max-w-full" actions={[{ label: unbreakable }]} />}
        crowded={
          <div className="flex flex-col gap-2">
            {people.map((person) => (
              <SplitButton key={person.id} label={person.role} className="max-w-full" actions={[{ label: person.name }]} />
            ))}
          </div>
        }
      />
    </div>
  )
}
