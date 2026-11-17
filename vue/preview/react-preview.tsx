import { DecisionInbox } from "@/registry/ui/decision-inbox"
import { LightboxGallery } from "@/registry/ui/lightbox"
import { TimeOffStats } from "@/registry/ui/time-off-stats"

import { inboxModel, lightboxModel, timeOffProps, type SceneLocale } from "../src/lib/scene"

export function ReactPreview({
  piece,
  scene,
  locale,
}: {
  piece: string
  scene: string
  locale: SceneLocale
}) {
  if (piece === "time-off-stats") {
    const props = timeOffProps(scene, locale)
    return (
      <div className="retana" data-retana-scene={scene} style={{ padding: 12 }}>
        <TimeOffStats
          available={props.available}
          pending={props.pending}
          years={props.years}
          loading={props.loading}
          error={props.error}
          labels={props.labels}
        />
      </div>
    )
  }
  if (piece === "decision-inbox") {
    const model = inboxModel(scene, locale)
    return (
      <div className="retana" data-retana-scene={scene} style={{ padding: 12 }}>
        <DecisionInbox items={model.items} loading={model.loading} error={model.error} labels={model.labels} />
      </div>
    )
  }
  const model = lightboxModel(scene, locale)
  if (model.loading) {
    return (
      <div className="retana" data-retana-scene={scene} role="status" style={{ padding: 12 }}>
        {model.loadingLabel}
      </div>
    )
  }
  if (model.error) {
    return (
      <div className="retana" data-retana-scene={scene} style={{ padding: 12 }}>
        <p role="alert">{model.error}</p>
      </div>
    )
  }
  if (model.items.length === 0) {
    return (
      <div className="retana" data-retana-scene={scene} style={{ padding: 12 }}>
        <p>{model.emptyLabel}</p>
      </div>
    )
  }
  return (
    <div className="retana" data-retana-scene={scene} style={{ padding: 12 }}>
      <LightboxGallery
        items={model.items}
        closeLabel={model.closeLabel}
        previousLabel={model.previousLabel}
        nextLabel={model.nextLabel}
        zoomInLabel={model.zoomInLabel}
        zoomOutLabel={model.zoomOutLabel}
      />
    </div>
  )
}
