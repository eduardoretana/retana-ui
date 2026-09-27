"use client"

import { AttachmentChip } from "@/registry/ui/attachment-chip"

export default function AttachmentChipPreview() {
  return (
    <div className="flex h-full items-center gap-2 bg-background p-3">
      <AttachmentChip name="anexo-bruma.pdf" size={240_000} type="application/pdf" removeLabel="Quitar" onRemove={() => {}} />
    </div>
  )
}
