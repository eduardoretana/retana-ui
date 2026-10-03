import type { Metadata } from "next"

import { ViewGalleryDemo } from "./demo"

export const metadata: Metadata = {
  title: "Gallery view",
  description: "Cuadrícula de tarjetas con portada, estado y filtros por un campo.",
}

export default function ViewGalleryPage() {
  return <ViewGalleryDemo />
}
