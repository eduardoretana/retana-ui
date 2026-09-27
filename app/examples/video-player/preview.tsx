"use client"

import { VideoPlayer } from "@/registry/ui/video-player"

const poster = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#cfc8be"/><circle cx="320" cy="180" r="36" fill="#5f5952"/></svg>`,
)}`

export default function VideoPlayerPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <VideoPlayer
        src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
        poster={poster}
        label="Video de ejemplo"
        playLabel="Reproducir"
        pauseLabel="Pausa"
      />
    </div>
  )
}
