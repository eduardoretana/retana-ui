"use client"

import { LogoMarquee } from "@/registry/ui/logo-marquee"

const names = ["Bruma", "Norte", "Orilla", "Cálamo", "Lumen"]

export default function LogoMarqueePreview() {
  return (
    <div className="flex h-full items-center bg-background">
      <LogoMarquee label="Estudios" duration={18}>
        {names.map((name) => (
          <span key={name} className="text-sm font-medium tracking-wide text-muted-foreground">
            {name}
          </span>
        ))}
      </LogoMarquee>
    </div>
  )
}
