"use client"

import { HeroSection } from "@/registry/blocks/hero-section"

export default function HeroSectionPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <HeroSection
        className="min-h-0"
        variant="editorial"
        animateIn={false}
        title="La semana, lista"
        description="El horno y la galería."
        primaryAction={{ label: "Reservar", doneLabel: "Listo" }}
        secondaryAction={null}
        brands={["Inés", "Mateo", "Lucía"]}
      />
    </div>
  )
}
