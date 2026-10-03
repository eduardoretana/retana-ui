"use client"

import { Trash2 } from "lucide-react"

import { ConfirmMorph } from "@/registry/ui/confirm-morph"

export default function ConfirmMorphPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <ConfirmMorph label="Eliminar" icon={<Trash2 />} onConfirm={() => {}} onUndo={() => {}} />
    </div>
  )
}
