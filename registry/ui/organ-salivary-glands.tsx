import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Built from Z-Anatomy by packages/registry/scripts/models/salivary-glands.ts
// in organui/organui. The GLB is hosted by organui.com under its own licence;
// see attribution.source.
export const salivaryGlandsModel: OrganModel = {
  name: "Salivary glands",
  src: "https://organui.com/models/salivary-glands.glb",
  bytes: 754496,
  defaultView: "Inferior",
  views: [
    {
      name: "Right lateral",
      direction: [-1, 0, 0],
    },
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Inferior",
      direction: [0, -1, 0.25],
    },
  ],
  structures: [
    {
      id: "right-parotid-gland",
      label: "Right parotid gland",
      group: "Parotid glands",
      color: "#c98a6b",
      description:
        "The largest salivary gland. It wraps around the back of the jaw in front of the ear and makes a watery saliva, mostly when you eat.",
    },
    {
      id: "left-parotid-gland",
      label: "Left parotid gland",
      group: "Parotid glands",
      color: "#d49a7a",
      description:
        "The parotid gland on the left side, in front of the ear and over the angle of the jaw.",
    },
    {
      id: "right-accessory-parotid-gland",
      label: "Right accessory parotid gland",
      group: "Parotid glands",
      color: "#b97a5c",
      description:
        "A small, separate lobe of parotid tissue that lies along the duct on the cheek. Many people have one.",
    },
    {
      id: "left-accessory-parotid-gland",
      label: "Left accessory parotid gland",
      group: "Parotid glands",
      color: "#c4876a",
      description: "The accessory lobe on the left, beside the parotid duct.",
    },
    {
      id: "right-parotid-duct",
      label: "Right parotid duct",
      group: "Parotid glands",
      color: "#e3c06a",
      description:
        "Stensen’s duct. It runs forward across the cheek, turns through the cheek muscle and opens inside the mouth beside the upper second molar.",
    },
    {
      id: "left-parotid-duct",
      label: "Left parotid duct",
      group: "Parotid glands",
      color: "#d6b25a",
      description:
        "The duct of the left parotid gland, opening opposite the upper second molar.",
    },
    {
      id: "right-submandibular-gland",
      label: "Right submandibular gland",
      group: "Submandibular glands",
      color: "#b5677a",
      description:
        "A walnut-sized gland under the body of the jaw. It makes most of the saliva in the mouth between meals.",
    },
    {
      id: "left-submandibular-gland",
      label: "Left submandibular gland",
      group: "Submandibular glands",
      color: "#c27788",
      description:
        "The submandibular gland on the left, tucked under the jaw in front of its angle.",
    },
    {
      id: "right-submandibular-duct",
      label: "Right submandibular duct",
      group: "Submandibular glands",
      color: "#e8cf7a",
      description:
        "Wharton’s duct. It runs forward along the floor of the mouth and opens on a small bump beside the frenulum under the tongue.",
    },
    {
      id: "left-submandibular-duct",
      label: "Left submandibular duct",
      group: "Submandibular glands",
      color: "#dcc06b",
      description:
        "The duct of the left submandibular gland. Its long upward course is why salivary stones form here most often.",
    },
    {
      id: "right-sublingual-gland",
      label: "Right sublingual gland",
      group: "Sublingual glands",
      color: "#8f7bb0",
      description:
        "The smallest of the major salivary glands. It lies under the lining of the floor of the mouth and drains through many tiny ducts.",
    },
    {
      id: "left-sublingual-gland",
      label: "Left sublingual gland",
      group: "Sublingual glands",
      color: "#9d8abd",
      description:
        "The sublingual gland on the left, beside the submandibular duct under the tongue.",
    },
    {
      id: "mandible",
      label: "Mandible",
      group: "Neighbours",
      color: "#e2d6b8",
      description:
        "The lower jaw. The parotid gland wraps its back edge and the submandibular gland sits beneath its body.",
    },
    {
      id: "tongue",
      label: "Tongue",
      group: "Neighbours",
      color: "#c96f6a",
      description:
        "The sublingual glands and the submandibular ducts lie beneath it, in the floor of the mouth.",
    },
    {
      id: "hyoid-bone",
      label: "Hyoid bone",
      group: "Neighbours",
      color: "#d6cba9",
      description:
        "A U-shaped bone below the jaw. The submandibular gland rests above it.",
    },
  ],
  attribution: {
    credit:
      "Z-Anatomy (CC BY-SA 4.0), based in part on BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 Japan). Adapted by OrganUI.",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source:
      "https://github.com/organui/organui/blob/master/apps/web/public/models/salivary-glands.ATTRIBUTION.md",
  },
}

export type SalivaryGlandsProps = Omit<OrganViewerProps, "model">

export function SalivaryGlands(props: SalivaryGlandsProps) {
  return <OrganViewer model={salivaryGlandsModel} {...props} />
}
