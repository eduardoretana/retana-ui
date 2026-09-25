import type { Metadata } from "next"

import { CatalogBrowser } from "@/app/catalog/catalog-browser"
import { SiteHeader } from "@/app/catalog/site-header"
import { catalogCategories, getCatalog } from "@/lib/catalog"

export const metadata: Metadata = {
  title: "Catalog",
  description: "Browsable catalog of Retana UI registry items.",
}

type HomeProps = {
  searchParams: Promise<{ q?: string; type?: string; category?: string }>
}

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams
  const items = getCatalog()

  return (
    <>
      <SiteHeader />
      <main>
        <CatalogBrowser
          items={items}
          categories={catalogCategories(items)}
          initialQuery={params.q ?? ""}
          initialKind={params.type ?? "all"}
          initialCategory={params.category ?? "all"}
        />
      </main>
    </>
  )
}
