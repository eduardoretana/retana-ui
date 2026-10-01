"use client"

import { CtaSection } from "@/registry/blocks/cta-section"

export default function CtaSectionPreview() {
  return (
    <div className="h-full bg-background p-3">
      <CtaSection
        className="[&_h2]:text-xl"
        variant="banner"
        title="El viernes hay horno"
        description="Quedan bancos."
        primaryAction={{ label: "Ver", confirmedLabel: "Listo" }}
        onDismiss={() => {}}
      />
    </div>
  )
}
