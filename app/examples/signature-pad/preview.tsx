"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { SignaturePad } from "@/registry/ui/signature-pad"

export default function SignaturePadPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <SignaturePad signer={atelier.name} label="Firma" className="w-full" />
    </div>
  )
}
