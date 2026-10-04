"use client"

import { useWebcam } from "@/registry/retana/hooks/use-webcam"

export default function Preview() {
  const cam = useWebcam()
  return (
    <div className="bg-background p-3 text-sm">
      <p>Camera: {cam.status}</p>
      <button type="button" className="mt-2 rounded-md border border-border px-2 py-1" onClick={() => void cam.start()}>Start</button>
    </div>
  )
}
