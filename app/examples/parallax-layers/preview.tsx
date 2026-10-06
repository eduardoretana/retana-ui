"use client"

import { ParallaxLayers } from "@/registry/ui/parallax-layers"

export default function Preview() {
  return (
    <ParallaxLayers
      label="Paisaje del taller"
      className="h-full"
      layers={[
        {
          id: "sky",
          speed: 0.15,
          decorative: true,
          className: "bg-muted",
          children: <span className="absolute top-4 right-6 size-8 rounded-full bg-accent" />,
        },
        {
          id: "ridge",
          speed: 0.45,
          decorative: true,
          children: <span className="absolute inset-x-0 bottom-6 h-16 rounded-t-xl bg-secondary" />,
        },
        {
          id: "card",
          speed: 0.8,
          children: <span className="absolute inset-x-4 bottom-3 rounded-lg border border-border bg-card px-3 py-2 text-xs">Costa</span>,
        },
      ]}
    />
  )
}
