"use client"

import { DownloadProgress } from "@/registry/ui/download-progress"

export default function Preview() {
  return (
    <div className="bg-background p-3">
      <DownloadProgress title="Atlas pack" description="Reference plates for the studio." state="downloading" loaded={210_000_000} total={470_000_000} meta={[{ label: "Size", value: "470 MB" }, { label: "Edition", value: "3" }]} />
    </div>
  )
}
