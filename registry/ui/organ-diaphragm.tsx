import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// The diaphragm has no explorer repository: scripts/models/diaphragm.ts builds
// the GLB, served from apps/web/public/models with its attribution beside it.
export const diaphragmModel: OrganModel = {
  name: "Diaphragm",
  src: "https://organui.com/models/diaphragm.glb",
  bytes: 3649120,
  defaultView: "Anterior",
  hiddenIds: ["right-lung-lower-lobe", "left-lung-lower-lobe"],
  views: [
    {
      name: "Anterior",
      direction: [0, 0.25, 1],
    },
    {
      name: "Inferior",
      direction: [0, -1, 0.35],
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
      id: "right-hemidiaphragm",
      label: "Right hemidiaphragm",
      group: "Diaphragm",
      tone: "chart-1", shade: 0.09,
      description:
        "The right dome, which rises higher than the left because the liver lies beneath it. Its right crus arises from the first three lumbar vertebrae, and the right phrenic nerve supplies it.",
    },
    {
      id: "left-hemidiaphragm",
      label: "Left hemidiaphragm",
      group: "Diaphragm",
      tone: "chart-1", shade: 0.13,
      description:
        "The left dome, over the stomach and spleen. The heart rests on the central tendon where the two halves meet, and the left phrenic nerve supplies this side.",
    },
    {
      id: "esophagus",
      label: "Esophagus",
      group: "Passing through",
      tone: "chart-1", shade: 0.16,
      description:
        "Passes through the esophageal hiatus at about T10, a sling of the right crus that also helps keep stomach contents from refluxing.",
    },
    {
      id: "inferior-vena-cava",
      label: "Inferior vena cava",
      group: "Passing through",
      tone: "chart-4", shade: 0.02,
      description:
        "Passes through the caval opening in the central tendon at about T8. Breathing in widens the opening and helps blood return to the heart.",
    },
    {
      id: "descending-aorta",
      label: "Descending aorta",
      group: "Passing through",
      tone: "chart-1", shade: 0.02,
      description:
        "Passes behind the diaphragm, under the median arcuate ligament between the crura at about T12, so its flow is not squeezed when the diaphragm contracts.",
    },
    {
      id: "heart",
      label: "Heart",
      group: "Above",
      tone: "chart-1", shade: 0.09,
      description:
        "Sits on the central tendon inside the pericardium, which is fused to the diaphragm's upper surface.",
    },
    {
      id: "right-lung-lower-lobe",
      label: "Lower lobe of right lung",
      group: "Above",
      tone: "chart-4", shade: 0.21,
      description:
        "Its base rests on the right dome. The pleural recess around the dome's edge is where fluid collects first.",
    },
    {
      id: "left-lung-lower-lobe",
      label: "Lower lobe of left lung",
      group: "Above",
      tone: "chart-4", shade: 0.24,
      description:
        "Its base rests on the left dome and follows it down as the diaphragm contracts in a breath.",
    },
    {
      id: "liver",
      label: "Liver",
      group: "Below",
      tone: "chart-1", shade: -0.04,
      description:
        "Fills the underside of the right dome. Its bare area touches the diaphragm directly, with no peritoneum between them.",
    },
    {
      id: "stomach",
      label: "Stomach",
      group: "Below",
      tone: "chart-1", shade: 0.18,
      description:
        "Its fundus sits under the left dome. Part of it can slide up through a widened esophageal hiatus as a hiatal hernia.",
    },
    {
      id: "spleen",
      label: "Spleen",
      group: "Below",
      tone: "chart-1", shade: -0.03,
      description:
        "Lies against the back of the left dome, over the 9th to 11th ribs.",
    },
    {
      id: "right-psoas-major",
      label: "Right psoas major",
      group: "Behind",
      tone: "chart-1", shade: 0.03,
      description:
        "Runs down from the lumbar spine. The medial arcuate ligament, one of the diaphragm's origins, arches over its upper end. Cut below the diaphragm here.",
    },
    {
      id: "left-psoas-major",
      label: "Left psoas major",
      group: "Behind",
      tone: "chart-1", shade: 0.06,
      description:
        "The left psoas, under the left medial arcuate ligament. Cut below the diaphragm here.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/organui/blob/master/apps/web/public/models/diaphragm.ATTRIBUTION.md",
  },
}

export type DiaphragmProps = Omit<OrganViewerProps, "model">

export function Diaphragm(props: DiaphragmProps) {
  return <OrganViewer model={diaphragmModel} {...props} />
}
