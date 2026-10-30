"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

import { captureLocale } from "@/app/catalog/capture-query"
import { MagneticBentoGrid } from "@/registry/blocks/magnetic-bento"

function DemoInner() {
  const params = useSearchParams()
  const locale = captureLocale(params.get("locale"))
  return <MagneticBentoGrid locale={locale === "en" ? "en" : "es-MX"} />
}

export function Demo() {
  return (
    <Suspense fallback={null}>
      <DemoInner />
    </Suspense>
  )
}
