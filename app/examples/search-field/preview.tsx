"use client"

import { SearchField } from "@/registry/ui/search-field"

export default function SearchFieldPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <SearchField label="Buscar" value="celadon" onValueChange={() => {}} className="w-full" />
    </div>
  )
}
