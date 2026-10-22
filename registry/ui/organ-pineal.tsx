import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Built in this repository by scripts/models/build.ts from BodyParts3D 4.3.
// The GLB is served from organui.com; see attribution.source.
const framed = [
  "pineal-gland",
  "habenula",
  "posterior-commissure",
  "left-thalamus",
  "right-thalamus",
  "superior-colliculi",
  "inferior-colliculi",
]

export const pinealModel: OrganModel = {
  name: "Pineal gland",
  src: "https://organui.com/models/pineal.glb",
  bytes: 1107736,
  defaultView: "Posterior",
  views: [
    {
      name: "Posterior",
      direction: [0, 0.4, -1],
      structureIds: framed,
    },
    {
      name: "Left lateral",
      direction: [1, 0, 0],
      structureIds: framed,
    },
    {
      name: "Superior",
      direction: [0, 1, 0],
      structureIds: framed,
    },
  ],
  hiddenIds: ["corpus-callosum"],
  structures: [
    {
      id: "pineal-gland",
      label: "Pineal gland",
      group: "Pineal gland",
      color: "#d68a6e",
      description:
        "A pine-cone-shaped gland the size of a grain of rice, deep in the middle of the brain. It releases melatonin at night, timed by signals from the eyes about light and dark.",
    },
    {
      id: "habenula",
      label: "Habenula",
      group: "Epithalamus",
      color: "#c9a27a",
      description:
        "A small pair of nuclei at the base of the pineal stalk. It links the forebrain to the midbrain and takes part in reward and aversion.",
    },
    {
      id: "left-stria-medullaris",
      label: "Left stria medullaris",
      group: "Epithalamus",
      color: "#b88e68",
      description:
        "A band of fibres along the top of the left thalamus that carries signals forward to the habenula.",
    },
    {
      id: "right-stria-medullaris",
      label: "Right stria medullaris",
      group: "Epithalamus",
      color: "#a87d5d",
      description:
        "The matching band of fibres along the top of the right thalamus.",
    },
    {
      id: "posterior-commissure",
      label: "Posterior commissure",
      group: "Epithalamus",
      color: "#e2b25c",
      description:
        "A bundle of fibres crossing the midline just below the pineal stalk. It joins the two sides of the pupil reflex, so light in one eye narrows both pupils.",
    },
    {
      id: "left-thalamus",
      label: "Left thalamus",
      group: "Thalamus",
      color: "#9b8d83",
      description:
        "The relay station for sensation and movement on the left side. The pineal gland lies behind the two thalami, above the midbrain.",
    },
    {
      id: "right-thalamus",
      label: "Right thalamus",
      group: "Thalamus",
      color: "#aa9c91",
      description:
        "The matching relay station on the right side, joined to the left one across the third ventricle.",
    },
    {
      id: "superior-colliculi",
      label: "Superior colliculi",
      group: "Midbrain tectum",
      color: "#c7a577",
      description:
        "The upper pair of bumps on the back of the midbrain, directly under the pineal gland. They steer the eyes and head toward what you see.",
    },
    {
      id: "inferior-colliculi",
      label: "Inferior colliculi",
      group: "Midbrain tectum",
      color: "#d6b486",
      description:
        "The lower pair of bumps, relay stations on the hearing pathway. A pineal tumour can press on the tectum and limit upward gaze.",
    },
    {
      id: "third-ventricle",
      label: "Third ventricle",
      group: "Ventricles",
      color: "#6f9ca3",
      description:
        "The narrow fluid space between the thalami. The pineal stalk forms part of its back wall.",
    },
    {
      id: "cerebral-aqueduct",
      label: "Cerebral aqueduct",
      group: "Ventricles",
      color: "#628e98",
      description:
        "The channel through the midbrain that drains the third ventricle. A pineal mass can squeeze it and back fluid up into the brain.",
    },
    {
      id: "right-internal-cerebral-vein",
      label: "Right internal cerebral vein",
      group: "Veins",
      color: "#6d8db0",
      description:
        "Runs back over the roof of the third ventricle and joins its partner above the pineal gland. The model includes the right one only.",
    },
    {
      id: "great-cerebral-vein",
      label: "Great cerebral vein",
      group: "Veins",
      color: "#7f9fbf",
      description:
        "The short vein of Galen, formed just behind and above the pineal gland, that drains the deep brain into the straight sinus.",
    },
    {
      id: "straight-sinus",
      label: "Straight sinus",
      group: "Veins",
      color: "#5f7fa6",
      description:
        "A venous channel in the dura that carries blood from the great cerebral vein back toward the base of the skull.",
    },
    {
      id: "corpus-callosum",
      label: "Corpus callosum",
      group: "Cerebrum",
      color: "#e4dccb",
      description:
        "The thick band of fibres joining the two hemispheres. Its back end, the splenium, arches over the pineal gland.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/organui/blob/master/apps/web/public/models/pineal.ATTRIBUTION.md",
  },
}

export type PinealProps = Omit<OrganViewerProps, "model">

export function Pineal(props: PinealProps) {
  return <OrganViewer model={pinealModel} {...props} />
}
