"use client"

import { VideoPlayer } from "@/registry/ui/video-player"

const poster = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#d5cfc4"/><rect y="240" width="640" height="120" fill="#b7b0a6"/><circle cx="480" cy="90" r="28" fill="#7d766e"/></svg>`,
)}`

export function Demo() {
  return (
    <VideoPlayer
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      poster={poster}
      label="Recorrido por el taller"
      playLabel="Reproducir"
      pauseLabel="Pausa"
      seekLabel="Posición"
      muteLabel="Silenciar"
      unmuteLabel="Activar sonido"
      volumeLabel="Volumen"
      speedLabel="Velocidad"
      fullscreenLabel="Pantalla completa"
      exitFullscreenLabel="Salir de pantalla completa"
    />
  )
}
