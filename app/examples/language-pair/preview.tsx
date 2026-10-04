"use client"

import { LanguagePair } from "@/registry/ui/language-pair"

export default function Preview() {
  return (
    <div className="bg-background p-3">
      <LanguagePair defaultFrom="es" defaultTo="en" />
    </div>
  )
}
