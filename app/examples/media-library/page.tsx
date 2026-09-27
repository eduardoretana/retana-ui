import type { Metadata } from "next"

import { MediaLibraryDemo } from "./demo"

export const metadata: Metadata = {
  title: "Media library",
  description: "Campo de medios y biblioteca con subida inyectada.",
}

export default function MediaLibraryPage() {
  return <MediaLibraryDemo />
}
