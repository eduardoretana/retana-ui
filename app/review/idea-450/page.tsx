"use client"

import { use, useEffect, useState } from "react"
import { House, Search, User } from "lucide-react"

import { filled } from "@/app/examples/avatar-group/fixtures"
import { SiteHeader } from "@/app/catalog/site-header"
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
import { AvatarGroup } from "@/registry/ui/avatar-group"
import { DockNav, type DockNavItem } from "@/registry/ui/dock-nav"

const dockItems: DockNavItem[] = [
  { value: "home", label: "Inicio", icon: <House />, group: "main" },
  { value: "search", label: "Buscar", icon: <Search />, kind: "search", group: "account" },
  { value: "profile", label: "Perfil", icon: <User />, group: "account" },
]

const shots = ["badge", "dialog", "dock", "header", "circle", "circle-above", "card"] as const
type Shot = (typeof shots)[number] | "all"

const copy = {
  es: {
    cardTitle: "Horno 2",
    cardBody: "Gres, turno de la tarde. La tarjeta usa el radio xl del tema.",
    cardDetail: "Cuatro piezas en el estante de arriba.",
    badgeHeading: "Badge",
    unread: "3 sin leer",
    circle: "Círculo del taller",
    circleHeading: "Círculo",
    aboveHeading: "Nombres arriba",
    stackHeading: "Grupo de avatares",
    stackLabel: "Equipo del horno",
    dockHeading: "Dock",
    dialogTitle: "Aviso del taller",
    dialogBody: "El horno sigue en marcha. Este texto va sobre la superficie.",
    open: "Abrir aviso",
  },
  en: {
    cardTitle: "Kiln 2",
    cardBody: "Stoneware, afternoon shift. The card uses the theme xl radius.",
    cardDetail: "Four pieces on the upper shelf.",
    badgeHeading: "Badge",
    unread: "3 unread",
    circle: "Workshop circle",
    circleHeading: "Circle",
    aboveHeading: "Names above",
    stackHeading: "Avatar group",
    stackLabel: "Kiln crew",
    dockHeading: "Dock",
    dialogTitle: "Workshop notice",
    dialogBody: "The kiln is still firing. This text sits on the surface.",
    open: "Open notice",
  },
} as const

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "")
}

function shotOf(value: string): Shot {
  return (shots as readonly string[]).includes(value) ? (value as Shot) : "all"
}

export default function Idea450ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = use(searchParams)
  const shot = shotOf(one(params.shot))
  const theme = one(params.theme)
  const locale = one(params.locale) === "en" ? "en" : "es"
  const transparency = one(params.transparency)
  const text = copy[locale]
  const show = (id: Shot) => shot === "all" || shot === id
  const [open, setOpen] = useState(shot === "dialog")
  const [dock, setDock] = useState("home")

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") root.classList.add("dark")
    if (theme === "light") root.classList.remove("dark")
    if (transparency === "reduce") root.dataset.transparency = "reduce"
    else delete root.dataset.transparency
  }, [theme, transparency])

  return (
    <div className="min-h-dvh bg-background text-foreground" data-review-shot={shot} data-locale={locale}>
      <style>{`
        html[data-transparency="reduce"] [data-glass="floating"] {
          background-color: var(--background) !important;
          -webkit-backdrop-filter: none !important;
          backdrop-filter: none !important;
        }
      `}</style>
      {show("header") || shot === "all" ? (
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-primary" data-shot="underlay" />
          <SiteHeader />
        </div>
      ) : null}
      <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-6">
        {show("card") ? (
          <section id="card" data-shot="card" className="flex flex-col gap-3">
            <h1 className="text-base font-semibold">{text.cardTitle}</h1>
            <Card>
              <CardHeader>
                <CardTitle>{text.cardTitle}</CardTitle>
                <CardDescription>{text.cardBody}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{text.cardDetail}</p>
              </CardContent>
            </Card>
          </section>
        ) : null}
        {show("badge") ? (
          <section id="badge" data-shot="badge" className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">{text.badgeHeading}</h2>
            <div className="flex flex-wrap items-center gap-2">
              {shot === "all" ? (
                <>
                  <Badge>Listo</Badge>
                  <Badge variant="secondary">8</Badge>
                  <Badge variant="outline">+12</Badge>
                  <Badge variant="destructive">Error</Badge>
                </>
              ) : null}
              <span data-shot="badge-new" className="inline-flex items-center gap-2">
                <Badge variant="count" count={3} aria-label={text.unread} />
                <Badge variant="dot" count={3} aria-label={text.unread} />
              </span>
            </div>
          </section>
        ) : null}
        {show("circle") ? (
          <section id="circle" data-shot="circle" className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">{text.circleHeading}</h2>
            <AvatarGroup layout="circle" namePlace="below" members={filled} size="lg" label={text.circle} />
          </section>
        ) : null}
        {show("circle-above") ? (
          <section id="circle-above" data-shot="circle-above" className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">{text.aboveHeading}</h2>
            <AvatarGroup layout="circle" namePlace="above" members={filled} size="lg" label={text.circle} />
          </section>
        ) : null}
        {shot === "all" ? (
          <section id="avatars" data-shot="avatars" className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">{text.stackHeading}</h2>
            <AvatarGroup members={filled.map((person) => ({ name: person.name }))} max={3} label={text.stackLabel} />
          </section>
        ) : null}
        {show("dock") ? (
          <section id="dock" data-shot="dock" className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">{text.dockHeading}</h2>
            <div className="rounded-xl bg-primary px-2 py-8">
              <DockNav label="Principal" items={dockItems} value={dock} onValueChange={setDock} position="inline" />
            </div>
          </section>
        ) : null}
        {show("dialog") ? (
          <section id="dialog-trigger" data-shot="dialog-trigger">
            <Button type="button" onClick={() => setOpen(true)}>
              {text.open}
            </Button>
          </section>
        ) : null}
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
      {show("dialog") ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{text.dialogTitle}</DialogTitle>
              <DialogDescription>{text.dialogBody}</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}
