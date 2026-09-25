import { Suspense } from "react"
import type { Metadata } from "next"

import { LeadsDemo } from "@/components/demo/leads-demo"

export const metadata: Metadata = {
  title: "Lead example",
  description: "The layered panel on a CRM lead, with Spanish labels.",
}

export default function LeadExamplePage() {
  return (
    <Suspense fallback={<div className="grid h-dvh place-items-center text-sm text-muted-foreground">Cargando pipeline…</div>}>
      <LeadsDemo />
    </Suspense>
  )
}
