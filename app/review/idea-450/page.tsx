"use client"

import { useState } from "react"
import { House, Search, User } from "lucide-react"

import { SiteHeader } from "@/app/catalog/site-header"
import { people } from "@/app/examples/arc/demo-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { filled } from "@/app/examples/avatar-group/fixtures"
import { AvatarGroup } from "@/registry/ui/avatar-group"
import { DockNav, type DockNavItem } from "@/registry/ui/dock-nav"

const crew = people.slice(0, 4).map((person) => ({ name: person.name }))

const dockItems: DockNavItem[] = [
  { value: "home", label: "Inicio", icon: <House />, group: "main" },
  { value: "search", label: "Buscar", icon: <Search />, kind: "search", group: "account" },
  { value: "profile", label: "Perfil", icon: <User />, group: "account" },
]

export default function Idea450ReviewPage() {
  const [open, setOpen] = useState(false)
  const [dock, setDock] = useState("home")

  return (
    <div className="min-h-[160vh] bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-6">
        <div className="h-24 rounded-md bg-primary" data-shot="underlay" />
        <section id="card" data-shot="card" className="flex flex-col gap-3">
          <h1 className="text-base font-semibold">Tarjeta</h1>
          <Card>
            <CardHeader>
              <CardTitle>Horno 2</CardTitle>
              <CardDescription>Gres, turno de la tarde.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>La tarjeta usa el radio xl del tema.</p>
            </CardContent>
          </Card>
        </section>
        <section id="badge" data-shot="badge" className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Badge</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Listo</Badge>
            <Badge variant="secondary">8</Badge>
            <Badge variant="outline">+12</Badge>
            <Badge variant="destructive">Error</Badge>
            <span data-shot="badge-new" className="inline-flex items-center gap-2">
              <Badge variant="count" count={3} aria-label="3 sin leer" />
              <Badge variant="dot" count={3} aria-label="3 sin leer" />
            </span>
          </div>
        </section>
        <section id="circle" data-shot="circle" className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Círculo</h2>
          <AvatarGroup layout="circle" members={filled} size="lg" label="Círculo del taller" />
        </section>
        <section id="circle-above" data-shot="circle-above" className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Nombres arriba</h2>
          <AvatarGroup layout="circle" namePlace="above" members={filled} size="lg" label="Círculo del taller" />
        </section>
        <section id="avatars" data-shot="avatars" className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Grupo de avatares</h2>
          <AvatarGroup members={crew} max={4} label="Equipo del horno" />
        </section>
        <section id="dock" data-shot="dock" className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Dock</h2>
          <DockNav label="Principal" items={dockItems} value={dock} onValueChange={setDock} position="inline" />
        </section>
        <section id="dialog-trigger" data-shot="dialog-trigger">
          <Button type="button" onClick={() => setOpen(true)}>
            Abrir aviso
          </Button>
        </section>
        <div id="radius-probes" className="pointer-events-none absolute top-0 left-0 size-0 overflow-hidden opacity-0" aria-hidden="true">
          <div data-radius="sm" className="size-12 rounded-sm bg-card" />
          <div data-radius="md" className="size-12 rounded-md bg-card" />
          <div data-radius="lg" className="size-12 rounded-lg bg-card" />
          <div data-radius="xl" className="size-12 rounded-xl bg-card" />
          <div data-radius="2xl" className="size-12 rounded-2xl bg-card" />
          <div data-radius="3xl" className="size-12 rounded-3xl bg-card" />
          <div data-radius="4xl" className="size-12 rounded-4xl bg-card" />
          <div data-radius="full" className="size-12 rounded-full bg-card" />
        </div>
      </main>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aviso del taller</DialogTitle>
            <DialogDescription>El horno sigue en marcha. Este texto va sobre la superficie.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
