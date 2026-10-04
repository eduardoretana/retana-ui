"use client"

import { MegaMenu } from "@/registry/ui/mega-menu"

import { storeMenu } from "./data"

export default function MegaMenuPreview() {
  return (
    <div className="flex h-full items-start justify-center overflow-hidden bg-muted/30 p-3">
      <div className="w-full origin-top scale-[0.62]">
        <MegaMenu label="Store" items={storeMenu} layout="wide" defaultValue="products" openOn="click" />
      </div>
    </div>
  )
}
