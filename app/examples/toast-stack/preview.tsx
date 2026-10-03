"use client"

import { Button } from "@/components/ui/button"
import { ToastStack, ToastStackProvider, useToastStack } from "@/registry/ui/toast-stack"

function Open() {
  const { toast } = useToastStack()
  return (
    <Button type="button" size="sm" onClick={() => toast({ title: "Horno listo", type: "success", duration: Infinity })}>
      Aviso
    </Button>
  )
}

export default function ToastStackPreview() {
  return (
    <ToastStackProvider>
      <div className="relative flex h-full items-end bg-background p-3">
        <Open />
        <ToastStack contained />
      </div>
    </ToastStackProvider>
  )
}
