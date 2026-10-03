"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { Button } from "@/components/ui/button"
import { ToastStack, ToastStackProvider, useToastStack } from "@/registry/ui/toast-stack"

function Controls() {
  const { toast } = useToastStack()
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" onClick={() => toast({ title: "Horno listo", description: "Cono 6 en el horno 2.", type: "success" })}>Aviso</Button>
      <Button type="button" variant="outline" onClick={() => toast({ title: "Revisar esmalte", type: "warning" })}>Aviso largo de espera</Button>
    </div>
  )
}

function StressButtons({ title }: { title: string }) {
  const { toast } = useToastStack()
  return <Button type="button" variant="outline" onClick={() => toast({ title, duration: Infinity })}>Mostrar</Button>
}

export function Demo() {
  return (
    <ToastStackProvider>
      <div className="relative flex min-h-80 flex-col gap-8">
        <Controls />
        <ToastStack contained />
        <StressCases
          empty={<p className="text-sm text-muted-foreground">La pila espera el primer aviso.</p>}
          long={<StressButtons title={unbreakable} />}
          crowded={
            <div className="flex flex-col gap-2">
              {Array.from({ length: 10 }, (_, index) => (
                <StressButtons key={index} title={`Aviso ${index + 1}`} />
              ))}
            </div>
          }
        />
      </div>
    </ToastStackProvider>
  )
}
