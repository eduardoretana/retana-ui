import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/thymus-3d at 4ec5c8f. The GLB stays in that
// repository under its own licence; see attribution.source.
export const thymusModel: OrganModel = {
  name: "Thymus",
  src: "https://cdn.jsdelivr.net/gh/organui/thymus-3d@4ec5c8f1dd75c7df93c94fbc1eb610dafec9d06c/public/models/thymus.glb",
  bytes: 4228216,
  defaultView: "Anterior",
  views: [
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Lateral",
      direction: [1, 0, 0],
    },
    {
      name: "Posterior",
      direction: [0, 0, -1],
    },
  ],
  structures: [
    {
      id: "right-lobe",
      label: "Right lobe",
      group: "Thymus",
      color: "#d79a86",
      description:
        "One of the two soft lobes of the thymus. It lies behind the upper sternum, in front of the superior vena cava and the ascending aorta.",
    },
    {
      id: "left-lobe",
      label: "Left lobe",
      group: "Thymus",
      color: "#e3ad94",
      description:
        "The other lobe, lying over the aortic arch and the pulmonary trunk. The two lobes meet in the midline.",
    },
    {
      id: "ascending-aorta",
      label: "Ascending aorta",
      group: "Arteries",
      color: "#c0564b",
      description:
        "The first part of the aorta, rising from the left ventricle behind the thymus.",
    },
    {
      id: "aortic-arch",
      label: "Aortic arch",
      group: "Arteries",
      color: "#b14a41",
      description:
        "Curves back and to the left over the root of the left lung. The thymus rests against its front.",
    },
    {
      id: "brachiocephalic-trunk",
      label: "Brachiocephalic trunk",
      group: "Arteries",
      color: "#cc6a5c",
      description:
        "The first branch of the arch. It supplies the right arm and the right side of the head and neck.",
    },
    {
      id: "left-common-carotid",
      label: "Left common carotid artery",
      group: "Arteries",
      color: "#d47b6b",
      description:
        "The second branch of the arch, running up the left side of the neck.",
    },
    {
      id: "left-subclavian",
      label: "Left subclavian artery",
      group: "Arteries",
      color: "#a8443d",
      description:
        "The third branch of the arch. It heads out toward the left arm.",
    },
    {
      id: "pulmonary-trunk",
      label: "Pulmonary trunk",
      group: "Arteries",
      color: "#7f86b8",
      description:
        "Carries blood from the right ventricle to the lungs. The lower part of the left lobe of the thymus lies over it.",
    },
    {
      id: "superior-vena-cava",
      label: "Superior vena cava",
      group: "Veins",
      color: "#5f7fae",
      description:
        "Returns blood from the head, neck and arms to the right atrium. The right lobe of the thymus lies in front of it.",
    },
    {
      id: "right-brachiocephalic-vein",
      label: "Right brachiocephalic vein",
      group: "Veins",
      color: "#6f8fbc",
      description:
        "A short vein that joins the left brachiocephalic vein to form the superior vena cava.",
    },
    {
      id: "left-brachiocephalic-vein",
      label: "Left brachiocephalic vein",
      group: "Veins",
      color: "#4f6f9f",
      description:
        "Crosses from left to right just behind the thymus. The small thymic veins, not modelled here, drain into it.",
    },
    {
      id: "heart",
      label: "Heart",
      group: "Neighbouring organs",
      color: "#b98a80",
      description:
        "The thymus sits in the upper front of the chest, just above and in front of the heart and the sac around it.",
    },
    {
      id: "trachea",
      label: "Trachea",
      group: "Neighbouring organs",
      color: "#c6cdbf",
      description:
        "The windpipe, behind the great vessels. In young children an enlarged thymus can extend up toward the neck in front of it.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/thymus-3d/blob/4ec5c8f1dd75c7df93c94fbc1eb610dafec9d06c/public/models/ATTRIBUTION.md",
  },
}

export type ThymusProps = Omit<OrganViewerProps, "model">

export function Thymus(props: ThymusProps) {
  return <OrganViewer model={thymusModel} {...props} />
}
