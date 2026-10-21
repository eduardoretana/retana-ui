import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/lungs-3d at 5815084. The GLB stays in that
// repository under its own licence; see attribution.source.
export const lungsModel: OrganModel = {
  name: "Lungs",
  src: "https://cdn.jsdelivr.net/gh/organui/lungs-3d@5815084f43efe438ebfae3fd889ee2baf343dfbf/public/models/lungs.glb",
  bytes: 3901260,
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
    {
      name: "Right lateral",
      direction: [-1, 0, 0],
    },
  ],
  structures: [
    {
      id: "FMA7338",
      label: "Right apical segment",
      group: "Right upper lobe",
      tone: "chart-1", shade: 0.14,
      description:
        "The tissue assigned to the right apical segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7339",
      label: "Right posterior segment",
      group: "Right upper lobe",
      tone: "chart-1", shade: 0.14,
      description:
        "The tissue assigned to the right posterior segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7359",
      label: "Right anterior segment",
      group: "Right upper lobe",
      tone: "chart-1", shade: 0.14,
      description:
        "The tissue assigned to the right anterior segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7361",
      label: "Right lateral segment",
      group: "Right middle lobe",
      tone: "chart-3", shade: 0.11,
      description:
        "The tissue assigned to the right lateral segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7360",
      label: "Right medial segment",
      group: "Right middle lobe",
      tone: "chart-3", shade: 0.11,
      description:
        "The tissue assigned to the right medial segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7366",
      label: "Right superior segment",
      group: "Right lower lobe",
      tone: "chart-1", shade: 0.07,
      description:
        "The tissue assigned to the right superior segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7364",
      label: "Right anterior basal segment",
      group: "Right lower lobe",
      tone: "chart-1", shade: 0.07,
      description:
        "The tissue assigned to the right anterior basal segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7363",
      label: "Right lateral basal segment",
      group: "Right lower lobe",
      tone: "chart-1", shade: 0.07,
      description:
        "The tissue assigned to the right lateral basal segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7362",
      label: "Right posterior basal segment",
      group: "Right lower lobe",
      tone: "chart-1", shade: 0.07,
      description:
        "The tissue assigned to the right posterior basal segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7372",
      label: "Left apicoposterior segment",
      group: "Left upper lobe",
      tone: "chart-2", shade: 0.18,
      description:
        "The tissue assigned to the left apicoposterior segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7373",
      label: "Left anterior segment",
      group: "Left upper lobe",
      tone: "chart-2", shade: 0.18,
      description:
        "The tissue assigned to the left anterior segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7374",
      label: "Superior lingular segment",
      group: "Left upper lobe",
      tone: "chart-2", shade: 0.18,
      description:
        "The tissue assigned to the superior lingular segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7375",
      label: "Inferior lingular segment",
      group: "Left upper lobe",
      tone: "chart-2", shade: 0.18,
      description:
        "The tissue assigned to the inferior lingular segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7376",
      label: "Left superior segment",
      group: "Left lower lobe",
      tone: "chart-4", shade: 0.08,
      description:
        "The tissue assigned to the left superior segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7378",
      label: "Left anterior basal segment",
      group: "Left lower lobe",
      tone: "chart-4", shade: 0.08,
      description:
        "The tissue assigned to the left anterior basal segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7379",
      label: "Left lateral basal segment",
      group: "Left lower lobe",
      tone: "chart-4", shade: 0.08,
      description:
        "The tissue assigned to the left lateral basal segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7380",
      label: "Left posterior basal segment",
      group: "Left lower lobe",
      tone: "chart-4", shade: 0.08,
      description:
        "The tissue assigned to the left posterior basal segment in BodyParts3D. Its shape and boundaries come from the source model.",
    },
    {
      id: "FMA7394",
      label: "Trachea",
      group: "Airway tree",
      tone: "chart-2", shade: 0.21,
      description:
        "The windpipe carries air toward the right and left main bronchi.",
    },
    {
      id: "FMA26661",
      label: "Right bronchial tree",
      group: "Airway tree",
      tone: "chart-2", shade: 0.14,
      description:
        "The available branches of the airway entering the right lung, grouped for selection.",
    },
    {
      id: "FMA26662",
      label: "Left bronchial tree",
      group: "Airway tree",
      tone: "chart-2", shade: 0.14,
      description:
        "The available branches of the airway entering the left lung, grouped for selection.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://lifesciencedb.jp/bp3d/info/index.html#License",
    source:
      "https://github.com/organui/lungs-3d/blob/5815084f43efe438ebfae3fd889ee2baf343dfbf/public/models/LICENSE.txt",
  },
}

export type LungsProps = Omit<OrganViewerProps, "model">

export function Lungs(props: LungsProps) {
  return <OrganViewer model={lungsModel} {...props} />
}
