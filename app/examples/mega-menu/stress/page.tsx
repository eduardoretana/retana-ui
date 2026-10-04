"use client"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { MegaMenu, type MegaMenuItem } from "@/registry/ui/mega-menu"

import { storeMenu } from "../data"

const longItem: MegaMenuItem = {
  id: "long",
  label: unbreakable,
  panel: {
    featured: {
      title: unbreakable,
      description: "Una frase ✨ y otra frase con más texto para ver el salto de línea.",
      cta: { label: "Abrir", href: "#long" },
    },
    columns: [
      {
        id: "col",
        title: "عمود",
        items: [{ id: "row", label: `${unbreakable}`, href: "#row" }],
        viewAll: { label: "View all", href: "#all" },
      },
    ],
  },
}

const many: MegaMenuItem[] = [
  { id: "home", label: "Home", href: "/" },
  ...Array.from({ length: 8 }, (_, index) => ({
    id: `item-${index + 1}`,
    label: `Section ${index + 1}`,
    href: `#s-${index + 1}`,
    badge: index === 0 ? "New" : undefined,
  })),
]

export default function MegaMenuStressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · mega menú</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            320px en acordeón, panel ancho, un enlace, muchas secciones, un nombre sin espacios, RTL y emoji.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="320px" width={320}>
        <MegaMenu label="Store" items={storeMenu} layout="narrow" defaultValue="products" openOn="click" />
      </StressCase>
      <StressCase label="Ancho">
        <MegaMenu label="Store" items={storeMenu} layout="wide" defaultValue="products" openOn="click" />
      </StressCase>
      <StressCase label="Un enlace" width={320}>
        <MegaMenu label="One" items={[{ id: "only", label: "Home", href: "/" }]} layout="narrow" />
      </StressCase>
      <StressCase label="Muchas secciones" width={320}>
        <MegaMenu label="Many" items={many} layout="narrow" />
      </StressCase>
      <StressCase label="Nombre largo" width={320}>
        <MegaMenu label="Long" items={[longItem]} layout="narrow" defaultValue="long" openOn="click" />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <MegaMenu
            label="المتجر"
            layout="narrow"
            defaultValue="products"
            openOn="click"
            items={[
              { id: "home", label: "الرئيسية", href: "/" },
              {
                id: "products",
                label: "المنتجات",
                panel: {
                  columns: [
                    {
                      id: "men",
                      title: "رجال",
                      items: [{ id: "shirts", label: "قمصان", href: "/shirts" }],
                      viewAll: { label: "عرض الكل", href: "/all" },
                    },
                  ],
                },
              },
            ]}
          />
        </div>
      </StressCase>
      <StressCase label="Emoji" width={320}>
        <MegaMenu
          label="Emoji"
          layout="narrow"
          defaultValue="shop"
          openOn="click"
          items={[
            {
              id: "shop",
              label: "Tienda ✨",
              badge: "New",
              panel: {
                highlights: [{ id: "hot", label: "Novedades 🔥", description: "Lo más pedido ⭐", href: "/hot" }],
              },
            },
          ]}
        />
      </StressCase>
    </main>
  )
}
