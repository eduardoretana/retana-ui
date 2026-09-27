"use client"

import { CodeBlock } from "@/registry/ui/code-block"

const code = `type Anexo = {
  plazo: number
}

export function ampliar(anexo: Anexo) {
  // Bruma pidió quince días más
  return { ...anexo, plazo: anexo.plazo + 15 }
}`

export function Demo() {
  return <CodeBlock code={code} filename="anexo.ts" language="ts" copyLabel="Copiar" copiedLabel="Copiado" />
}
