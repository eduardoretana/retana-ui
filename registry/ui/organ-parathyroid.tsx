import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Built from the BodyParts3D 4.3 meshes organui/thyroid-3d pins, cut down to
// the parathyroid glands and the structures that locate them. The GLB is
// hosted by OrganUI; see attribution.source.
export const parathyroidModel: OrganModel = {
  name: "Parathyroid",
  src: "https://organui.com/models/parathyroid.glb",
  bytes: 1099860,
  defaultView: "Posterior",
  views: [
    {
      name: "Posterior",
      direction: [0, 0, -1],
    },
    {
      name: "Right glands",
      direction: [-0.4, 0, -1],
      structureIds: [
        "right-superior-parathyroid",
        "right-inferior-parathyroid",
      ],
    },
    {
      name: "Left glands",
      direction: [0.4, 0, -1],
      structureIds: ["left-superior-parathyroid", "left-inferior-parathyroid"],
    },
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Right lateral",
      direction: [-1, 0, 0],
    },
  ],
  structures: [
    {
      id: "right-superior-parathyroid",
      label: "Right superior parathyroid",
      group: "Parathyroid glands",
      color: "#e0a35a",
      description:
        "A gland about the size of a grain of rice on the back of the upper right thyroid lobe. The four parathyroids release parathyroid hormone, which raises calcium in the blood.",
    },
    {
      id: "right-inferior-parathyroid",
      label: "Right inferior parathyroid",
      group: "Parathyroid glands",
      color: "#d48f4c",
      description:
        "Sits on the back of the lower right lobe. The lower glands start higher in the embryo and travel down, so their final position varies more than the upper ones.",
    },
    {
      id: "left-superior-parathyroid",
      label: "Left superior parathyroid",
      group: "Parathyroid glands",
      color: "#e8b56f",
      description:
        "On the back of the upper left lobe, near where the recurrent laryngeal nerve enters the larynx.",
    },
    {
      id: "left-inferior-parathyroid",
      label: "Left inferior parathyroid",
      group: "Parathyroid glands",
      color: "#cf8442",
      description:
        "On the back of the lower left lobe. Like its right partner, it is sometimes found lower down, even inside the thymus.",
    },
    {
      id: "right-lobe",
      label: "Right lobe",
      group: "Thyroid gland",
      color: "#b8655a",
      description:
        "The right wing of the thyroid gland. Both right parathyroids rest against its back surface.",
    },
    {
      id: "left-lobe",
      label: "Left lobe",
      group: "Thyroid gland",
      color: "#c47465",
      description:
        "The left wing of the thyroid gland, carrying the two left parathyroids on its back.",
    },
    {
      id: "isthmus",
      label: "Isthmus",
      group: "Thyroid gland",
      color: "#a5564d",
      description:
        "The bridge joining the two thyroid lobes across the front of the trachea.",
    },
    {
      id: "thyroid-cartilage",
      label: "Thyroid cartilage",
      group: "Larynx",
      color: "#c6cdbf",
      description:
        "The largest cartilage of the larynx, forming the Adam’s apple. Shown to place the glands in the neck.",
    },
    {
      id: "cricoid-cartilage",
      label: "Cricoid cartilage",
      group: "Larynx",
      color: "#b3bcae",
      description:
        "The ring of cartilage at the bottom of the larynx. The superior parathyroids usually lie near its level.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/organui/blob/master/apps/web/public/models/parathyroid.ATTRIBUTION.md",
  },
}

export type ParathyroidProps = Omit<OrganViewerProps, "model">

export function Parathyroid(props: ParathyroidProps) {
  return <OrganViewer model={parathyroidModel} {...props} />
}
