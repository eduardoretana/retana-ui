"use client"

import { CodeBlock } from "@/registry/ui/code-block"

const code = `export function nota(dias: number) {
  return dias + 15
}`

export default function CodeBlockPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <CodeBlock code={code} filename="nota.ts" language="ts" copyLabel="Copiar" copiedLabel="Copiado" />
    </div>
  )
}
