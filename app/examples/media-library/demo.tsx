"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { MediaAsset } from "@/registry/lib/admin-types"
import { EntityForm } from "@/registry/ui/entity-form"
import { MediaField, MediaLibrary } from "@/registry/ui/media-library"

function assetFrom(file: File): MediaAsset {
  return {
    id: crypto.randomUUID(),
    filename: file.name,
    mime: file.type || "application/octet-stream",
    size: file.size,
    url: URL.createObjectURL(file),
    width: null,
    height: null,
    createdAt: new Date().toISOString(),
  }
}

export function MediaLibraryDemo() {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [cover, setCover] = useState("")
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function upload(file: File) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const asset = assetFrom(file)
    setAssets((current) => [asset, ...current])
    return asset
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-6 bg-background p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Biblioteca</h1>
          <p className="text-sm text-muted-foreground">
            Suelta una imagen. Mientras sube, el formulario no se puede enviar.
          </p>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          Elegir portada
        </Button>
      </div>
      <MediaLibrary
        assets={assets}
        onUpload={upload}
        onDelete={async (id) => setAssets((current) => current.filter((asset) => asset.id !== id))}
      />
      <EntityForm
        open={open}
        onOpenChange={setOpen}
        title="Portada del proyecto"
        submitLabel="Guardar"
        cancelLabel="Cancelar"
        busy={busy}
        onSubmit={async () => undefined}
      >
        <MediaField
          label="Imagen"
          value={cover}
          onChange={setCover}
          assets={assets}
          onUpload={upload}
          onBusyChange={setBusy}
          pickLabel="Biblioteca"
          clearLabel="Quitar"
          hint="PNG, JPG o un vídeo corto."
        />
      </EntityForm>
    </main>
  )
}
