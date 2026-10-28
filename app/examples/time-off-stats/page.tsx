import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = { title: "Saldo de ausencias", description: "Disponible, pendiente y uso por año." }

export default function Page() {
  return (
    <ExampleFrame title="Saldo de ausencias" description="Los números los pone el anfitrión. El ejemplo usa el saldo del taller.">
      <Demo />
    </ExampleFrame>
  )
}
