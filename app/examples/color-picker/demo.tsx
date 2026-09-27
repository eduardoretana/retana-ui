"use client"

import { useState } from "react"

import { ColorPicker, hsvaToCss, type HsvaColor } from "@/registry/ui/color-picker"

export function Demo() {
  const [color, setColor] = useState<HsvaColor>({ h: 28, s: 0.45, v: 0.72, a: 1 })

  return (
    <div className="flex flex-wrap items-start gap-6">
      <ColorPicker
        value={color}
        onValueChange={setColor}
        hueLabel="Tono"
        alphaLabel="Alfa"
        hexLabel="Hexadecimal"
        saturationLabel="Saturación y brillo"
      />
      <p className="max-w-xs text-sm text-muted-foreground">
        El recuadro de al lado usa el color elegido para el borde, sin fijar una paleta en el componente.
      </p>
      <div className="size-24 rounded-xl border-4" style={{ borderColor: hsvaToCss(color), background: hsvaToCss({ ...color, a: 0.2 }) }} />
    </div>
  )
}
