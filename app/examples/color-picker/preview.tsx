"use client"

import { ColorPicker } from "@/registry/ui/color-picker"

export default function ColorPickerPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <ColorPicker hueLabel="Tono" alphaLabel="Alfa" hexLabel="Hex" saturationLabel="Saturación y brillo" className="w-full" />
    </div>
  )
}
