import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/thyroid-3d at 2c5ef5a. The GLB stays in that
// repository under its own licence; see attribution.source.
export const thyroidModel: OrganModel = {
  name: "Thyroid",
  src: "https://cdn.jsdelivr.net/gh/organui/thyroid-3d@2c5ef5a464cc6bfcb322c7d074dec79543346f86/public/models/thyroid.glb",
  bytes: 1833032,
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
      name: "Right lateral",
      direction: [-1, 0, 0],
    },
  ],
  structures: [
    {
      id: "right-lobe",
      label: "Right lobe",
      group: "Thyroid gland",
      color: "#b8655a",
      description:
        "One of the two wings of the thyroid gland. It wraps around the side of the trachea and the lower larynx.",
    },
    {
      id: "left-lobe",
      label: "Left lobe",
      group: "Thyroid gland",
      color: "#c47465",
      description:
        "The other wing of the gland, mirroring the right lobe on the left side of the trachea.",
    },
    {
      id: "isthmus",
      label: "Isthmus",
      group: "Thyroid gland",
      color: "#a5564d",
      description:
        "The narrow bridge that joins the two lobes across the front of the trachea, just below the cricoid cartilage.",
    },
    {
      id: "right-superior-parathyroid",
      label: "Right superior parathyroid",
      group: "Parathyroid glands",
      color: "#e0a35a",
      description:
        "A pea-sized gland on the back of the upper right lobe. The parathyroids control calcium levels in the blood.",
    },
    {
      id: "right-inferior-parathyroid",
      label: "Right inferior parathyroid",
      group: "Parathyroid glands",
      color: "#d48f4c",
      description: "A small gland on the back of the lower right lobe.",
    },
    {
      id: "left-superior-parathyroid",
      label: "Left superior parathyroid",
      group: "Parathyroid glands",
      color: "#e8b56f",
      description: "A small gland on the back of the upper left lobe.",
    },
    {
      id: "left-inferior-parathyroid",
      label: "Left inferior parathyroid",
      group: "Parathyroid glands",
      color: "#cf8442",
      description: "A small gland on the back of the lower left lobe.",
    },
    {
      id: "hyoid-bone",
      label: "Hyoid bone",
      group: "Larynx and trachea",
      color: "#e2d6b8",
      description:
        "A U-shaped bone above the larynx. It anchors muscles of the tongue and throat and does not touch any other bone.",
    },
    {
      id: "thyroid-cartilage",
      label: "Thyroid cartilage",
      group: "Larynx and trachea",
      color: "#c6cdbf",
      description:
        "The largest cartilage of the larynx, forming the Adam’s apple. The gland is named after it, though it sits below it.",
    },
    {
      id: "cricoid-cartilage",
      label: "Cricoid cartilage",
      group: "Larynx and trachea",
      color: "#b3bcae",
      description:
        "A ring of cartilage at the bottom of the larynx. The isthmus of the thyroid lies just below it.",
    },
    {
      id: "trachea",
      label: "Trachea",
      group: "Larynx and trachea",
      color: "#a7b4a6",
      description:
        "The windpipe. The thyroid lobes rest against its sides and the isthmus crosses its front.",
    },
    {
      id: "common-carotid-artery",
      label: "Right common carotid artery",
      group: "Arteries",
      color: "#b8564c",
      description:
        "The main artery to the head on this side. It runs up beside the thyroid lobe and divides near the top of the thyroid cartilage.",
    },
    {
      id: "superior-thyroid-artery",
      label: "Superior thyroid artery",
      group: "Arteries",
      color: "#d0836c",
      description:
        "The first branch of the external carotid artery. It descends to the upper pole of the lobe and divides over the gland.",
    },
    {
      id: "superior-thyroid-vein",
      label: "Superior thyroid vein",
      group: "Veins",
      color: "#6d8db0",
      description:
        "Drains the upper part of the lobe and follows the superior thyroid artery.",
    },
    {
      id: "middle-thyroid-vein",
      label: "Middle thyroid vein",
      group: "Veins",
      color: "#7f9fbf",
      description:
        "A short vein from the side of the lobe straight to the internal jugular vein.",
    },
    {
      id: "inferior-thyroid-veins",
      label: "Inferior thyroid veins",
      group: "Veins",
      color: "#5f7fa6",
      description:
        "A network of veins from the lower poles and isthmus that runs down in front of the trachea toward the brachiocephalic veins.",
    },
    {
      id: "right-recurrent-laryngeal-nerve",
      label: "Right recurrent laryngeal nerve",
      group: "Nerves",
      color: "#e3c95e",
      description:
        "A branch of the vagus nerve that climbs behind the thyroid lobe to the larynx and moves most of the vocal cord muscles.",
    },
    {
      id: "left-recurrent-laryngeal-nerve",
      label: "Left recurrent laryngeal nerve",
      group: "Nerves",
      color: "#d6b84a",
      description:
        "The left branch starts lower, looping under the aortic arch in the chest before climbing beside the trachea.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/thyroid-3d/blob/2c5ef5a464cc6bfcb322c7d074dec79543346f86/public/models/ATTRIBUTION.md",
  },
}

export type ThyroidProps = Omit<OrganViewerProps, "model">

export function Thyroid(props: ThyroidProps) {
  return <OrganViewer model={thyroidModel} {...props} />
}
