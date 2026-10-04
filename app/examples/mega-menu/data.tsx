"use client"

import { Footprints, Gem, Glasses, Shirt, ShoppingBag, Sparkles, Tag, Watch } from "lucide-react"

import type { MegaMenuItem } from "@/registry/ui/mega-menu"

const tile = (
  <span className="grid size-12 place-items-center rounded-xl bg-primary-foreground/15">
    <Shirt className="size-6" />
  </span>
)

export const storeMenu: MegaMenuItem[] = [
  { id: "home", label: "Home", href: "/" },
  {
    id: "products",
    label: "Products",
    panel: {
      featured: {
        title: "The weekday edit",
        description: "Quiet pieces for work and the weekend.",
        cta: { label: "Shop the edit", href: "/edit" },
        media: tile,
      },
      columns: [
        {
          id: "men",
          title: "Men",
          icon: <Shirt className="size-4" />,
          viewAll: { label: "View all", href: "/men" },
          items: [
            { id: "shirts", label: "Oxford shirts", href: "/men/shirts", icon: <Shirt className="size-4" /> },
            { id: "sneakers", label: "Sneakers", href: "/men/sneakers", icon: <Footprints className="size-4" /> },
          ],
        },
        {
          id: "women",
          title: "Women",
          icon: <ShoppingBag className="size-4" />,
          viewAll: { label: "View all", href: "/women" },
          items: [
            { id: "knits", label: "Knit layers", href: "/women/knits", icon: <Sparkles className="size-4" /> },
            { id: "totes", label: "Tote bags", href: "/women/totes", icon: <ShoppingBag className="size-4" /> },
          ],
        },
        {
          id: "accessories",
          title: "Accessories",
          icon: <Gem className="size-4" />,
          viewAll: { label: "View all", href: "/accessories" },
          items: [
            { id: "watches", label: "Watches", href: "/accessories/watches", icon: <Watch className="size-4" /> },
            { id: "glasses", label: "Glasses", href: "/accessories/glasses", icon: <Glasses className="size-4" /> },
            { id: "jewelry", label: "Jewelry", href: "/accessories/jewelry", icon: <Gem className="size-4" /> },
          ],
        },
      ],
      highlightsLabel: "Highlights",
      highlights: [
        { id: "new", label: "New arrivals", description: "Check what's new", href: "/new", icon: <Sparkles className="size-4" /> },
        { id: "best", label: "Best sellers", description: "Most popular", href: "/best", icon: <Tag className="size-4" /> },
      ],
    },
  },
  {
    id: "collections",
    label: "Collections",
    panel: {
      columns: [
        {
          id: "seasonal",
          title: "Seasonal",
          icon: <Sparkles className="size-4" />,
          viewAll: { label: "View all", href: "/collections" },
          items: [
            { id: "linen", label: "Linen season", href: "/collections/linen", icon: <Shirt className="size-4" /> },
            { id: "travel", label: "Travel kits", href: "/collections/travel", icon: <ShoppingBag className="size-4" /> },
          ],
        },
      ],
    },
  },
  { id: "offers", label: "Offers", href: "/offers", badge: "New" },
]
