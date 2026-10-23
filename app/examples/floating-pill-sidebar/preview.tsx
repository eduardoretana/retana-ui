"use client"

import { BookOpen, CalendarDays, Home } from "lucide-react"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { FloatingPillSidebar } from "@/registry/blocks/ae/floating-pill-sidebar"

export default function Preview() {
  return (
    <div className="ae-ember flex h-full items-center justify-center overflow-hidden bg-muted/50 p-3">
      <AeStagger className="w-full max-w-sm">
        <FloatingPillSidebar items={[{ id: "a", label: "Inicio", icon: Home }, { id: "b", label: "Cursos", icon: BookOpen }, { id: "c", label: "Agenda", icon: CalendarDays }]} active="b" />
      </AeStagger>
    </div>
  )
}
