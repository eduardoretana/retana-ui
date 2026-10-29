"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, unbreakable } from "@/app/examples/arc/demo-data"
import { CopyButton } from "@/registry/ui/copy-button"

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-3">
        <CopyButton value={atelier.email} label="Copy email" />
        <CopyButton value={atelier.phone} label="Copy" iconOnly />
        <CopyButton value={atelier.kiln} label="Copy note" variant="plain" />
      </div>
      <StressCases
        empty={<CopyButton value="" label="Copy empty" />}
        long={<CopyButton value={unbreakable} label={unbreakable} className="max-w-full" />}
        crowded={
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }, (_, index) => (
              <CopyButton key={index} value={`${atelier.email}?n=${index}`} label={`Copy ${index + 1}`} />
            ))}
          </div>
        }
      />
    </div>
  )
}
