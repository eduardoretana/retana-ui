import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/heart-3d at c72ce66. The GLB stays in that
// repository under its own licence; see attribution.source.
export const heartModel: OrganModel = {
  name: "Heart",
  src: "https://cdn.jsdelivr.net/gh/organui/heart-3d@c72ce6654ff8e282942f97750d3104f55ef4fc3d/public/models/heart.glb",
  bytes: 2524400,
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
      id: "right-atrium",
      label: "Right atrium",
      group: "Heart walls",
      color: "#a96d70",
      description:
        "Receives blood returning from the body and passes it to the right ventricle.",
    },
    {
      id: "left-atrium",
      label: "Left atrium",
      group: "Heart walls",
      color: "#b77c76",
      description:
        "Receives oxygen-rich blood from the lungs and passes it to the left ventricle.",
    },
    {
      id: "ventricular-wall",
      label: "Ventricular wall",
      group: "Heart walls",
      color: "#ab6159",
      description:
        "Muscular tissue surrounding the two lower pumping chambers of the heart.",
    },
    {
      id: "right-ventricle",
      label: "Right ventricular cavity",
      group: "Ventricular cavities",
      color: "#b86661",
      description:
        "The space inside the right ventricle, which pumps blood toward the lungs.",
    },
    {
      id: "left-ventricle",
      label: "Left ventricular cavity",
      group: "Ventricular cavities",
      color: "#d28b72",
      description:
        "The space inside the left ventricle, which pumps blood into the aorta.",
    },
    {
      id: "ascending-aorta",
      label: "Ascending aorta",
      group: "Great vessels",
      color: "#c37f6a",
      description: "The aorta carries blood away from the heart to the body.",
    },
    {
      id: "aortic-arch",
      label: "Aortic arch",
      group: "Great vessels",
      color: "#ca8d78",
      description:
        "Part of the aorta, the main artery carrying blood from the heart.",
    },
    {
      id: "pulmonary-trunk",
      label: "Pulmonary trunk",
      group: "Great vessels",
      color: "#789aab",
      description: "Carries blood from the right ventricle toward the lungs.",
    },
    {
      id: "superior-vena-cava",
      label: "Superior vena cava",
      group: "Great vessels",
      color: "#8c9fab",
      description:
        "One of the large veins returning blood from the body to the right atrium.",
    },
    {
      id: "left-coronary",
      label: "Left coronary artery",
      group: "Coronary arteries",
      color: "#dfb58a",
      description:
        "Supplies the heart muscle, including parts of the left heart and ventricular septum.",
    },
    {
      id: "right-coronary",
      label: "Right coronary artery",
      group: "Coronary arteries",
      color: "#d4a777",
      description: "Supplies the right atrium and parts of both ventricles.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International",
    license: "CC BY 4.0",
    licenseUrl: "https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html",
    source:
      "https://github.com/organui/heart-3d/blob/c72ce6654ff8e282942f97750d3104f55ef4fc3d/public/models/ATTRIBUTION.md",
  },
}

export type HeartProps = Omit<OrganViewerProps, "model">

export function Heart(props: HeartProps) {
  return <OrganViewer model={heartModel} {...props} />
}
