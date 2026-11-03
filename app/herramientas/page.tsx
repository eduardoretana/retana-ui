import type { Metadata } from "next"
import Link from "next/link"

import { ExampleFrame } from "@/app/examples/example-frame"
import manifest from "@/retana-ui.json"

export const metadata: Metadata = {
  title: "Herramientas",
  description: "Herramientas con un núcleo TypeScript y una interfaz que lo consume.",
}

export default function ToolsPage() {
  return (
    <ExampleFrame title="Herramientas" description="Cada herramienta declara un núcleo puro y las piezas de interfaz que lo muestran.">
      <ul className="flex flex-col gap-3">
        {manifest.tools.map((tool) => (
          <li key={tool.slug} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">{tool.slug}</p>
            <p className="text-xs text-muted-foreground">
              núcleo {tool.core} · interfaz {tool.ui.join(", ")}
            </p>
            <p className="mt-2 text-sm">
              <Link className="underline-offset-2 hover:underline" href={`/herramientas/${tool.slug}`}>
                Abrir demo
              </Link>
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{tool.docs}</p>
          </li>
        ))}
      </ul>
    </ExampleFrame>
  )
}
