"use client"

import { LightboxGallery } from "@/registry/ui/lightbox"

const tones = ["#ddd6cc", "#c9c1b6", "#b3aa9e", "#8f877d"]

const items = ["Estudio", "Patio", "Mesa", "Cerro"].map((name, index) => ({
  src: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" fill="${tones[index]}"/><text x="20" y="130" font-size="28" fill="#2a2724">${name}</text></svg>`,
  )}`,
  alt: name,
  caption: `${name} de Bruma, imagen de ejemplo.`,
}))

export function Demo() {
  return <LightboxGallery items={items} />
}
