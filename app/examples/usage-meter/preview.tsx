"use client"

import { UsageMeter } from "@/registry/ui/usage-meter"

export default function UsageMeterPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <UsageMeter
        className="w-full"
        label="Almacén"
        unit="GB"
        limit={100}
        freeLabel="Libre"
        segments={[
          { id: "glaze", label: "Esmalte", value: 42 },
          { id: "clay", label: "Barro", value: 28 },
        ]}
      />
    </div>
  )
}
