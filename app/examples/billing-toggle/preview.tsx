"use client"

import * as React from "react"

import { BillingPrice, BillingToggle } from "@/registry/ui/billing-toggle"

export default function BillingTogglePreview() {
  const [value, setValue] = React.useState("yearly")
  const yearly = value === "yearly"
  return (
    <div className="flex h-full items-center bg-background p-3">
      <div className="flex w-full min-w-0 flex-col gap-2">
        <BillingToggle
          value={value}
          onValueChange={setValue}
          options={[
            { value: "monthly", label: "Mes" },
            { value: "yearly", label: "Año", badge: "−20%", activeBadge: "−$48" },
          ]}
        />
        <BillingPrice amount={yearly ? 614 : 64} was={yearly ? 768 : undefined} period={yearly ? "/ año" : "/ mes"} />
      </div>
    </div>
  )
}
