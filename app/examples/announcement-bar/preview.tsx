"use client"

import { AnnouncementBar } from "@/registry/ui/announcement-bar"

export default function AnnouncementBarPreview() {
  return (
    <div className="bg-background">
      <AnnouncementBar
        controls
        autoPlay={false}
        messages={[
          { id: "kiln", message: "El horno ya está en temperatura." },
          { id: "gallery", message: "La galería abre el viernes." },
        ]}
      />
    </div>
  )
}
