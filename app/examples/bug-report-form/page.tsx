import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Reportar un error",
  description: "Formulario con tipo, prioridad, entorno y captura.",
}

export default function BugReportFormPage() {
  return (
    <ExampleFrame
      title="Reportar un error"
      description="Elige un tipo con las flechas, adjunta una captura y envía. El envío de prueba tarda un segundo y medio."
    >
      <Demo />
      <section className="flex flex-col gap-3 text-sm leading-6">
        <h2 className="text-lg font-semibold">Supabase, en el proyecto anfitrión</h2>
        <p className="text-muted-foreground">
          Esta pieza no depende de Supabase. Si el anfitrión ya tiene un cliente, el callback puede
          guardar el reporte y subir la captura.
        </p>
        <pre className="overflow-x-auto rounded-xl bg-muted p-4 text-xs leading-5">{`create table bug_reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  type text not null,
  priority text,
  environment text,
  created_at timestamptz default now()
);

const { data, error } = await supabase
  .from("bug_reports")
  .insert({ title, description, type, priority, environment })
  .select("id")
  .single()
if (error) throw error

for (const file of files) {
  const uploaded = await supabase.storage
    .from("bug-screenshots")
    .upload(\`\${data.id}/\${file.name}\`, file)
  if (uploaded.error) throw uploaded.error
}`}</pre>
      </section>
    </ExampleFrame>
  )
}
