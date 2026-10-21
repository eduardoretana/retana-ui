import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/esophagus-3d at ba0fddb. The GLB stays in that
// repository under its own licence; see attribution.source.
export const esophagusModel: OrganModel = {
  name: "Esophagus",
  src: "https://cdn.jsdelivr.net/gh/organui/esophagus-3d@ba0fddba344ae586f266586a9a30f3fce10f2aec/public/models/esophagus.glb",
  bytes: 4001332,
  defaultView: "Anterior",
  views: [
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Posterior",
      direction: [0, 0, -1],
    },
    {
      name: "Left lateral",
      direction: [1, 0, 0],
    },
  ],
  structures: [
    {
      id: "esophagus",
      label: "Esophagus",
      group: "Esophagus",
      tone: "chart-1", shade: 0.12,
      description:
        "A muscular tube about 25 cm long that carries swallowed food from the throat to the stomach. It runs behind the trachea and the heart and passes through the diaphragm.",
    },
    {
      id: "stomach",
      label: "Stomach",
      group: "Neighbouring organs",
      tone: "chart-2", shade: 0.11,
      description:
        "The esophagus ends just below the diaphragm, which is not shown, by opening into the stomach at the cardia.",
    },
    {
      id: "trachea",
      label: "Trachea",
      group: "Neighbouring organs",
      tone: "muted-foreground", shade: 0.21,
      description:
        "The windpipe lies directly in front of the esophagus in the neck and upper chest, until it divides into the two main bronchi.",
    },
    {
      id: "main-bronchi",
      label: "Main bronchi",
      group: "Neighbouring organs",
      tone: "muted-foreground", shade: 0.16,
      description:
        "The left main bronchus crosses in front of the esophagus and presses a shallow narrowing into it.",
    },
    {
      id: "thyroid-gland",
      label: "Thyroid gland",
      group: "Neighbouring organs",
      tone: "chart-1", shade: 0.1,
      description:
        "Wraps around the front and sides of the trachea in the lower neck, beside the start of the esophagus.",
    },
    {
      id: "left-atrium",
      label: "Left atrium",
      group: "Neighbouring organs",
      tone: "chart-1", shade: 0.1,
      description:
        "The back of the heart. The esophagus lies directly behind it, separated only by the pericardium.",
    },
    {
      id: "aortic-arch",
      label: "Arch of aorta",
      group: "Arteries",
      tone: "chart-1", shade: 0.01,
      description:
        "Curves over the left main bronchus, crossing the left side of the esophagus and leaving a narrowing where it presses on it.",
    },
    {
      id: "descending-aorta",
      label: "Descending aorta",
      group: "Arteries",
      tone: "chart-1", shade: -0.03,
      description:
        "Runs down behind and to the left of the esophagus. Near the diaphragm the esophagus crosses in front of it.",
    },
    {
      id: "esophageal-arteries",
      label: "Esophageal arteries",
      group: "Arteries",
      tone: "chart-1", shade: 0.14,
      description:
        "Small branches of the aorta that supply the thoracic part of the esophagus.",
    },
    {
      id: "inferior-thyroid-arteries",
      label: "Inferior thyroid arteries",
      group: "Arteries",
      tone: "chart-1", shade: 0.06,
      description:
        "Supply the thyroid gland and send branches to the esophagus in the neck.",
    },
    {
      id: "left-gastric-artery",
      label: "Left gastric artery",
      group: "Arteries",
      tone: "chart-1", shade: 0.1,
      description:
        "Runs along the upper curve of the stomach and sends branches up to the abdominal part of the esophagus.",
    },
    {
      id: "azygos-vein",
      label: "Azygos vein",
      group: "Veins",
      tone: "chart-4", shade: 0.01,
      description:
        "Runs up the right side of the spine, behind the esophagus, and drains most of the esophagus in the chest.",
    },
    {
      id: "hemiazygos-veins",
      label: "Hemiazygos veins",
      group: "Veins",
      tone: "chart-4", shade: 0.1,
      description:
        "Run up the left side of the spine and cross behind the aorta to join the azygos vein.",
    },
    {
      id: "left-gastric-vein",
      label: "Left gastric vein",
      group: "Veins",
      tone: "chart-4", shade: 0.15,
      description:
        "Drains the lower esophagus into the portal system. Its link with the azygos veins is where esophageal varices form when portal pressure rises.",
    },
    {
      id: "right-vagus-nerve",
      label: "Right vagus nerve",
      group: "Nerves",
      tone: "chart-2", shade: 0.09,
      description:
        "Descends beside the esophagus, joins the esophageal plexus and passes through the hiatus mostly behind it, as the posterior vagal trunk.",
    },
    {
      id: "left-vagus-nerve",
      label: "Left vagus nerve",
      group: "Nerves",
      tone: "chart-2", shade: 0.01,
      description:
        "Crosses the aortic arch, then spreads over the esophagus and passes through the hiatus mostly in front of it, as the anterior vagal trunk.",
    },
    {
      id: "recurrent-laryngeal-nerves",
      label: "Recurrent laryngeal nerves",
      group: "Nerves",
      tone: "chart-2", shade: 0.16,
      description:
        "Branches of the vagus that climb back up in the groove between the trachea and esophagus to reach the larynx.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/esophagus-3d/blob/ba0fddba344ae586f266586a9a30f3fce10f2aec/public/models/ATTRIBUTION.md",
  },
}

export type EsophagusProps = Omit<OrganViewerProps, "model">

export function Esophagus(props: EsophagusProps) {
  return <OrganViewer model={esophagusModel} {...props} />
}
