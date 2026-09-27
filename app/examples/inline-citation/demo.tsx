"use client"

import { InlineCitation } from "@/registry/ui/inline-citation"

export function Demo() {
  return (
    <article className="rounded-xl border border-border bg-card p-5 text-sm leading-7">
      <p>
        Nube encontró el cambio en el anexo de privacidad
        <InlineCitation
          index={1}
          source={{
            title: "Anexo de privacidad, Clínica Norte",
            domain: "norte.example",
            excerpt: "Los datos de pacientes no salen del expediente clínico.",
            href: "https://example.com/norte",
          }}
        />
        y lo contrastó con la minuta de marzo
        <InlineCitation
          index={2}
          source={{
            title: "Minuta 12 de marzo",
            domain: "orilla.example",
            excerpt: "Se acordó no ampliar el plazo sin firma de ambas partes.",
          }}
        />
        .
      </p>
    </article>
  )
}
