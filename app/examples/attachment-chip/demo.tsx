"use client"

import { useState } from "react"

import { AttachmentChip } from "@/registry/ui/attachment-chip"

const preview = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#d9d3c8"/><circle cx="32" cy="28" r="10" fill="#6e675f"/></svg>`,
)}`

const seed = [
  { id: "pdf", name: "anexo-bruma.pdf", size: 248_320, type: "application/pdf" },
  { id: "img", name: "patio.png", size: 86_016, type: "image/png", previewUrl: preview },
  { id: "zip", name: "planos.zip", size: 1_400_000, type: "application/zip" },
]

export function Demo() {
  const [files, setFiles] = useState(seed)
  return (
    <ul className="flex flex-col gap-2">
      {files.map((file) => (
        <li key={file.id}>
          <AttachmentChip
            {...file}
            removeLabel="Quitar"
            onRemove={() => setFiles((current) => current.filter((item) => item.id !== file.id))}
          />
        </li>
      ))}
    </ul>
  )
}
