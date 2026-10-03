import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Presencia con Supabase",
  description: "Adaptador de Supabase Realtime Presence. La demo no abre un canal real.",
}

export default function PresenceSupabasePage() {
  return (
    <ExampleFrame
      title="Presencia con Supabase"
      description="El estado de presencia se lee de sync, join y leave. La autorización del canal sigue en el proyecto del anfitrión."
    >
      <Demo />
    </ExampleFrame>
  )
}
