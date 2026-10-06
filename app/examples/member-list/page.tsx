import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { MemberListDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Lista de personas",
  description: "Avatar, rol y un menú. El dueño lleva un sufijo.",
}

export default function Page() {
  return (
    <ExampleFrame title="Lista de personas" description="Avatar, rol y un menú. El dueño lleva un sufijo.">
      <Demo />
    </ExampleFrame>
  )
}
