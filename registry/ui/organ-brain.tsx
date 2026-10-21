import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/brain-3d at e2f8c17. The GLB stays in that
// repository under its own licence; see attribution.source.
export const brainModel: OrganModel = {
  name: "Brain",
  src: "https://cdn.jsdelivr.net/gh/organui/brain-3d@e2f8c172716d8f4e8db6080b7d23f38fabe3add8/public/models/brain.glb",
  bytes: 5865004,
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
    {
      name: "Superior",
      direction: [0, 1, 0],
    },
    {
      name: "Inferior",
      direction: [0, -1, 0],
    },
  ],
  structures: [
    {
      id: "left-frontal",
      label: "Left frontal lobe",
      group: "Cerebral lobes",
      tone: "chart-1", shade: 0.12,
      description:
        "The front portion of a cerebral hemisphere; it includes cortical regions involved in planning and voluntary movement.",
    },
    {
      id: "right-frontal",
      label: "Right frontal lobe",
      group: "Cerebral lobes",
      tone: "chart-1", shade: 0.18,
      description:
        "The front portion of a cerebral hemisphere; it includes cortical regions involved in planning and voluntary movement.",
    },
    {
      id: "left-parietal",
      label: "Left parietal lobe",
      group: "Cerebral lobes",
      tone: "chart-2", shade: 0.1,
      description:
        "A superior-posterior part of a cerebral hemisphere that participates in integrating bodily sensory information.",
    },
    {
      id: "right-parietal",
      label: "Right parietal lobe",
      group: "Cerebral lobes",
      tone: "chart-2", shade: 0.15,
      description:
        "A superior-posterior part of a cerebral hemisphere that participates in integrating bodily sensory information.",
    },
    {
      id: "left-temporal",
      label: "Left temporal lobe",
      group: "Cerebral lobes",
      tone: "chart-1", shade: 0.06,
      description:
        "A lower lateral part of a cerebral hemisphere that includes regions involved in hearing and memory.",
    },
    {
      id: "right-temporal",
      label: "Right temporal lobe",
      group: "Cerebral lobes",
      tone: "chart-1", shade: 0.11,
      description:
        "A lower lateral part of a cerebral hemisphere that includes regions involved in hearing and memory.",
    },
    {
      id: "left-occipital",
      label: "Left occipital lobe",
      group: "Cerebral lobes",
      tone: "muted-foreground", shade: 0.05,
      description:
        "The posterior part of a cerebral hemisphere and the principal cortical region for visual processing.",
    },
    {
      id: "right-occipital",
      label: "Right occipital lobe",
      group: "Cerebral lobes",
      tone: "muted-foreground", shade: 0.09,
      description:
        "The posterior part of a cerebral hemisphere and the principal cortical region for visual processing.",
    },
    {
      id: "left-hippocampus",
      label: "Left hippocampus",
      group: "Deep structures",
      tone: "chart-2", shade: 0.1,
      description:
        "A curved deep structure of the temporal region involved in forming and organizing memories.",
    },
    {
      id: "right-hippocampus",
      label: "Right hippocampus",
      group: "Deep structures",
      tone: "chart-2", shade: 0.15,
      description:
        "A curved deep structure of the temporal region involved in forming and organizing memories.",
    },
    {
      id: "midbrain",
      label: "Midbrain",
      group: "Brainstem & cerebellum",
      tone: "chart-1", shade: 0.01,
      description:
        "The upper portion of the brainstem, between the forebrain and pons.",
    },
    {
      id: "pons",
      label: "Pons",
      group: "Brainstem & cerebellum",
      tone: "chart-1", shade: 0.07,
      description:
        "The rounded middle portion of the brainstem, anterior to the cerebellum.",
    },
    {
      id: "medulla",
      label: "Medulla oblongata",
      group: "Brainstem & cerebellum",
      tone: "muted-foreground", shade: -0.02,
      description:
        "The lowest portion of the brainstem, continuous inferiorly with the spinal cord.",
    },
    {
      id: "cerebellum",
      label: "Cerebellum",
      group: "Brainstem & cerebellum",
      tone: "chart-2", shade: 0.09,
      description:
        "A folded structure behind the brainstem that helps coordinate movement and balance.",
    },
    {
      id: "left-lateral-ventricle",
      label: "Left lateral ventricle",
      group: "Ventricular spaces",
      tone: "chart-4", shade: 0.03,
      description:
        "One of the paired cavities deep in the cerebrum through which cerebrospinal fluid circulates.",
    },
    {
      id: "right-lateral-ventricle",
      label: "Right lateral ventricle",
      group: "Ventricular spaces",
      tone: "chart-4", shade: 0.07,
      description:
        "One of the paired cavities deep in the cerebrum through which cerebrospinal fluid circulates.",
    },
    {
      id: "third-ventricle",
      label: "Third ventricle",
      group: "Ventricular spaces",
      tone: "chart-4", shade: -0.01,
      description:
        "A narrow midline cavity connected to the lateral ventricles and cerebral aqueduct.",
    },
    {
      id: "cerebral-aqueduct",
      label: "Cerebral aqueduct",
      group: "Ventricular spaces",
      tone: "chart-4", shade: -0.06,
      description:
        "A narrow channel through the midbrain linking the third and fourth ventricles.",
    },
    {
      id: "fourth-ventricle",
      label: "Fourth ventricle",
      group: "Ventricular spaces",
      tone: "chart-4", shade: 0.03,
      description:
        "A cavity between the brainstem and cerebellum that receives fluid from the cerebral aqueduct.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International",
    license: "CC BY 4.0",
    licenseUrl: "https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html",
    source:
      "https://github.com/organui/brain-3d/blob/e2f8c172716d8f4e8db6080b7d23f38fabe3add8/public/models/ATTRIBUTION.md",
  },
}

export type BrainProps = Omit<OrganViewerProps, "model">

export function Brain(props: BrainProps) {
  return <OrganViewer model={brainModel} {...props} />
}
