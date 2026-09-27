"use client"

import { InlineCitation } from "@/registry/ui/inline-citation"

export default function InlineCitationPreview() {
  return (
    <p className="bg-background p-4 text-sm leading-7">
      El plazo pasa a 45 días
      <InlineCitation
        index={1}
        source={{
          title: "Anexo B de Bruma",
          domain: "bruma.example",
          excerpt: "La entrega se cuenta desde la firma del anexo.",
          href: "https://example.com/anexo",
        }}
      />
      .
    </p>
  )
}
