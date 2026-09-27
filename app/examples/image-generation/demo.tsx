"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ImageGeneration, type ImageGenerationStatus } from "@/registry/ui/image-generation"

const src = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><rect width="640" height="480" fill="#d8d2c8"/><rect y="300" width="640" height="180" fill="#b7b0a4"/><circle cx="470" cy="120" r="48" fill="#8d857a"/><path d="M40 320 L180 180 L300 320 Z" fill="#6e675f"/></svg>`,
)}`

export function Demo() {
  const [status, setStatus] = useState<ImageGenerationStatus>("generating")
  const [progress, setProgress] = useState(28)

  return (
    <div className="flex flex-col gap-4">
      <ImageGeneration
        status={status}
        progress={progress}
        src={src}
        alt="Boceto de un estudio junto a un cerro"
        prompt="Boceto: estudio Bruma, cerro bajo, tarde nublada."
        generatingLabel="Generando"
        errorLabel="No se pudo generar la imagen"
        retryLabel="Reintentar"
        idleLabel="Esperando un prompt"
        frameClassName="aspect-video"
        onRetry={() => {
          setStatus("generating")
          setProgress(12)
        }}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setProgress((value) => Math.min(100, value + 20))}>
          Avanzar
        </Button>
        <Button type="button" size="sm" onClick={() => setStatus("done")}>
          Revelar
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setStatus("error")}>
          Simular error
        </Button>
      </div>
    </div>
  )
}
