import type { Metadata } from "next"

import { SiteHeader } from "@/app/catalog/site-header"

import { HerramientasDesk } from "./desk"

export const metadata: Metadata = {
  title: "Herramientas",
  description: "Piezas con lógica, no solo interfaz. La primera es un motor de guardas para agentes.",
}

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Herramientas</p>
          <h1 className="text-2xl font-semibold tracking-tight">Motor de reglas de guardas</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Datos 100% ficticios de la marca sintética. El mismo puerto ApprovalGate evalúa un WhatsApp y un{" "}
            <code>git.merge</code>. No hay endpoints ni secretos.
          </p>
        </header>
        <HerramientasDesk />
      </main>
    </>
  )
}
