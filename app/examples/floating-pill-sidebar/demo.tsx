"use client"

import { BookOpen, CalendarDays, Home } from "lucide-react"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { FloatingPillSidebar } from "@/registry/blocks/ae/floating-pill-sidebar"

export function Demo() {
  return (
    <div className="ae-ember rounded-[2rem] bg-muted/50 p-6">
      <AeStagger className="mx-auto max-w-md">
        <FloatingPillSidebar items={[{ id: "a", label: "Inicio", icon: Home }, { id: "b", label: "Cursos", icon: BookOpen }, { id: "c", label: "Agenda", icon: CalendarDays }]} active="b" />
      </AeStagger>
    </div>
  )
}
