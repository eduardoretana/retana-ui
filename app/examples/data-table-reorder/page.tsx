import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { DataTableReorderDemo } from "./demo"

export const metadata: Metadata = {
  title: "Tabla con reorden",
  description: "Tabla densa cuyas filas se deslizan al cambiar el orden. Datos inventados.",
}

export default function Page() {
  return (
    <ExampleFrame title="Tabla con reorden" description="Ordena una columna. Las filas se deslizan a su lugar. El detalle es la tarjeta flotante." size="wide">
      <DataTableReorderDemo />
    </ExampleFrame>
  )
}
