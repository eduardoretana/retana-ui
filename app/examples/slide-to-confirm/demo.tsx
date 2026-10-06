"use client"

import * as React from "react"

import { SlideToConfirm } from "@/registry/ui/slide-to-confirm"

export function Demo() {
  const [done, setDone] = React.useState(0)
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <SlideToConfirm onConfirm={() => setDone((value) => value + 1)}>Desliza para enviar</SlideToConfirm>
      <SlideToConfirm disabled label="Deshabilitado" />
      <p className="text-sm text-muted-foreground">Confirmaciones: {done}</p>
    </div>
  )
}
