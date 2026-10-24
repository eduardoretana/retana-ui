import type { Metadata } from "next"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Chat de agentes",
  description: "Conversación con coordinación, agentes en curso y panel de encargo.",
}

export default function ExamplePage() {
  return <Demo />
}
