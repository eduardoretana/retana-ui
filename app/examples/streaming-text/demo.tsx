"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { StreamingText } from "@/registry/ui/streaming-text"

const full = `## Nota de Nube

El contrato de **Clínica Norte** cambia en dos puntos:

- El plazo pasa de 30 a 45 días
- La revisión de privacidad queda en [el anexo](https://example.com)

La cláusula de pago no se toca.`

export function Demo() {
  const [text, setText] = useState("")
  const [run, setRun] = useState(0)

  useEffect(() => {
    let index = 0
    const id = window.setInterval(() => {
      index += 4
      setText(full.slice(0, index))
      if (index >= full.length) window.clearInterval(id)
    }, 40)
    return () => window.clearInterval(id)
  }, [run])

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <StreamingText text={text} streaming={text.length < full.length} cursorLabel="Generando" />
      </div>
      <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setRun((value) => value + 1)}>
        Volver a generar
      </Button>
    </div>
  )
}
