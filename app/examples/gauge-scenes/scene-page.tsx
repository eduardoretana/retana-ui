"use client"

import type { ReactNode } from "react"
import Link from "next/link"

import { ExampleFrame } from "@/app/examples/example-frame"

const links = [
  { href: "/examples/gauge-scenes/car", label: "Tablero" },
  { href: "/examples/gauge-scenes/cockpit", label: "Cabina" },
  { href: "/examples/gauge-scenes/health", label: "Salud" },
  { href: "/examples/gauge-scenes/monitor", label: "Monitor" },
  { href: "/examples/gauge-scenes/smart-home", label: "Casa" },
  { href: "/examples/gauge-scenes/time", label: "Relojes" },
  { href: "/examples/gauge-scenes/weather", label: "Clima" },
]

export function ScenePage({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <ExampleFrame wide title={title} description={description}>
      <nav className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="min-w-0">{children}</div>
    </ExampleFrame>
  )
}
