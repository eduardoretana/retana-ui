"use client"

import { LogoMarquee } from "@/registry/ui/logo-marquee"

const names = ["Bruma", "Norte", "Orilla", "Cálamo", "Lumen", "Senda"]

export function Demo() {
  return (
    <div className="rounded-xl border border-border py-6">
      <LogoMarquee label="Estudios ficticios" duration={22}>
        {names.map((name) => (
          <span key={name} className="text-lg font-semibold tracking-tight">
            {name}
          </span>
        ))}
      </LogoMarquee>
    </div>
  )
}
