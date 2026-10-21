import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/teeth-3d at f2cfe96. The GLB stays in that
// repository under its own licence; see attribution.source.
export const teethModel: OrganModel = {
  name: "Teeth",
  src: "https://cdn.jsdelivr.net/gh/organui/teeth-3d@f2cfe96f19dba7ec3982f2b06e6a34a1f6670450/public/models/teeth.glb",
  bytes: 1518540,
  defaultView: "Anterior",
  views: [
    {
      name: "Anterior",
      direction: [0, 0, 1],
    },
    {
      name: "Right lateral",
      direction: [-1, 0, 0],
    },
    {
      name: "Posterior",
      direction: [0, 0, -1],
    },
  ],
  structures: [
    {
      id: "upper-right-central-incisor",
      label: "Upper right central incisor",
      group: "Upper right teeth",
      tone: "chart-2", shade: 0.3,
      description:
        "The widest front tooth. Its straight, chisel-shaped edge bites into food and shapes the look of a smile.",
    },
    {
      id: "upper-right-lateral-incisor",
      label: "Upper right lateral incisor",
      group: "Upper right teeth",
      tone: "chart-2", shade: 0.3,
      description:
        "A smaller, rounder version of the central incisor beside it. It helps cut food at the front of the mouth.",
    },
    {
      id: "upper-right-canine",
      label: "Upper right canine",
      group: "Upper right teeth",
      tone: "chart-2", shade: 0.28,
      description:
        "The eye tooth at the corner of the arch. It has a single pointed cusp for gripping and the longest root of any tooth.",
    },
    {
      id: "upper-right-first-premolar",
      label: "Upper right first premolar",
      group: "Upper right teeth",
      tone: "chart-2", shade: 0.26,
      description:
        "A tooth with two cusps, one on the cheek side and one on the palate side. It usually has two roots.",
    },
    {
      id: "upper-right-second-premolar",
      label: "Upper right second premolar",
      group: "Upper right teeth",
      tone: "chart-2", shade: 0.24,
      description:
        "Similar to the first premolar but with cusps of more equal size, and usually a single root.",
    },
    {
      id: "upper-right-first-molar",
      label: "Upper right first molar",
      group: "Upper right teeth",
      tone: "chart-2", shade: 0.22,
      description:
        "The largest upper tooth, with four cusps and three roots. It is often the first permanent tooth to erupt, around age six.",
    },
    {
      id: "upper-right-second-molar",
      label: "Upper right second molar",
      group: "Upper right teeth",
      tone: "chart-2", shade: 0.2,
      description:
        "A smaller grinding tooth with four cusps and three roots, erupting around age twelve.",
    },
    {
      id: "upper-left-central-incisor",
      label: "Upper left central incisor",
      group: "Upper left teeth",
      tone: "chart-2", shade: 0.3,
      description:
        "The widest front tooth. Its straight, chisel-shaped edge bites into food and shapes the look of a smile.",
    },
    {
      id: "upper-left-lateral-incisor",
      label: "Upper left lateral incisor",
      group: "Upper left teeth",
      tone: "chart-2", shade: 0.3,
      description:
        "A smaller, rounder version of the central incisor beside it. It helps cut food at the front of the mouth.",
    },
    {
      id: "upper-left-canine",
      label: "Upper left canine",
      group: "Upper left teeth",
      tone: "chart-2", shade: 0.28,
      description:
        "The eye tooth at the corner of the arch. It has a single pointed cusp for gripping and the longest root of any tooth.",
    },
    {
      id: "upper-left-first-premolar",
      label: "Upper left first premolar",
      group: "Upper left teeth",
      tone: "chart-2", shade: 0.26,
      description:
        "A tooth with two cusps, one on the cheek side and one on the palate side. It usually has two roots.",
    },
    {
      id: "upper-left-second-premolar",
      label: "Upper left second premolar",
      group: "Upper left teeth",
      tone: "chart-2", shade: 0.24,
      description:
        "Similar to the first premolar but with cusps of more equal size, and usually a single root.",
    },
    {
      id: "upper-left-first-molar",
      label: "Upper left first molar",
      group: "Upper left teeth",
      tone: "chart-2", shade: 0.22,
      description:
        "The largest upper tooth, with four cusps and three roots. It is often the first permanent tooth to erupt, around age six.",
    },
    {
      id: "upper-left-second-molar",
      label: "Upper left second molar",
      group: "Upper left teeth",
      tone: "chart-2", shade: 0.2,
      description:
        "A smaller grinding tooth with four cusps and three roots, erupting around age twelve.",
    },
    {
      id: "lower-left-central-incisor",
      label: "Lower left central incisor",
      group: "Lower left teeth",
      tone: "chart-2", shade: 0.3,
      description:
        "The smallest tooth in the mouth. Its thin, flat edge meets the back of the upper incisors when you bite.",
    },
    {
      id: "lower-left-lateral-incisor",
      label: "Lower left lateral incisor",
      group: "Lower left teeth",
      tone: "chart-2", shade: 0.3,
      description:
        "Slightly wider than the lower central incisor next to it, with a single flattened root.",
    },
    {
      id: "lower-left-canine",
      label: "Lower left canine",
      group: "Lower left teeth",
      tone: "chart-2", shade: 0.28,
      description:
        "The pointed tooth at the corner of the lower arch. It guides the jaw when it slides to the side.",
    },
    {
      id: "lower-left-first-premolar",
      label: "Lower left first premolar",
      group: "Lower left teeth",
      tone: "chart-2", shade: 0.26,
      description:
        "A tall cusp on the cheek side and a much smaller one on the tongue side, with a single root.",
    },
    {
      id: "lower-left-second-premolar",
      label: "Lower left second premolar",
      group: "Lower left teeth",
      tone: "chart-2", shade: 0.24,
      description:
        "Larger than the first premolar and often with three cusps. It has a single root.",
    },
    {
      id: "lower-left-first-molar",
      label: "Lower left first molar",
      group: "Lower left teeth",
      tone: "chart-2", shade: 0.22,
      description:
        "A broad grinding tooth with five cusps and two roots, front and back. It erupts around age six.",
    },
    {
      id: "lower-left-second-molar",
      label: "Lower left second molar",
      group: "Lower left teeth",
      tone: "chart-2", shade: 0.2,
      description:
        "A grinding tooth with four cusps and two roots, erupting around age twelve.",
    },
    {
      id: "lower-right-central-incisor",
      label: "Lower right central incisor",
      group: "Lower right teeth",
      tone: "chart-2", shade: 0.3,
      description:
        "The smallest tooth in the mouth. Its thin, flat edge meets the back of the upper incisors when you bite.",
    },
    {
      id: "lower-right-lateral-incisor",
      label: "Lower right lateral incisor",
      group: "Lower right teeth",
      tone: "chart-2", shade: 0.3,
      description:
        "Slightly wider than the lower central incisor next to it, with a single flattened root.",
    },
    {
      id: "lower-right-canine",
      label: "Lower right canine",
      group: "Lower right teeth",
      tone: "chart-2", shade: 0.28,
      description:
        "The pointed tooth at the corner of the lower arch. It guides the jaw when it slides to the side.",
    },
    {
      id: "lower-right-first-premolar",
      label: "Lower right first premolar",
      group: "Lower right teeth",
      tone: "chart-2", shade: 0.26,
      description:
        "A tall cusp on the cheek side and a much smaller one on the tongue side, with a single root.",
    },
    {
      id: "lower-right-second-premolar",
      label: "Lower right second premolar",
      group: "Lower right teeth",
      tone: "chart-2", shade: 0.24,
      description:
        "Larger than the first premolar and often with three cusps. It has a single root.",
    },
    {
      id: "lower-right-first-molar",
      label: "Lower right first molar",
      group: "Lower right teeth",
      tone: "chart-2", shade: 0.22,
      description:
        "A broad grinding tooth with five cusps and two roots, front and back. It erupts around age six.",
    },
    {
      id: "lower-right-second-molar",
      label: "Lower right second molar",
      group: "Lower right teeth",
      tone: "chart-2", shade: 0.2,
      description:
        "A grinding tooth with four cusps and two roots, erupting around age twelve.",
    },
    {
      id: "upper-gum",
      label: "Upper gum",
      group: "Gums",
      tone: "chart-1", shade: 0.15,
      description:
        "The gingiva around the necks of the upper teeth. It covers the bone of the upper jaw and seals around each tooth.",
    },
    {
      id: "lower-gum",
      label: "Lower gum",
      group: "Gums",
      tone: "chart-1", shade: 0.12,
      description:
        "The gingiva around the necks of the lower teeth, covering the tooth-bearing ridge of the mandible.",
    },
    {
      id: "right-maxilla",
      label: "Right maxilla",
      group: "Jaw bones",
      tone: "muted-foreground", shade: 0.18,
      description:
        "One half of the upper jaw. It holds the upper teeth on this side and forms part of the hard palate, the nose and the floor of the eye socket.",
    },
    {
      id: "left-maxilla",
      label: "Left maxilla",
      group: "Jaw bones",
      tone: "muted-foreground", shade: 0.16,
      description:
        "The other half of the upper jaw, mirroring the right maxilla. It is fixed to the skull and does not move.",
    },
    {
      id: "mandible",
      label: "Mandible",
      group: "Jaw bones",
      tone: "muted-foreground", shade: 0.13,
      description:
        "The lower jaw, the only bone of the skull that moves. It holds the lower teeth and hinges at the temporomandibular joints in front of the ears.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D / Anatomography, © The Database Center for Life Science. CC BY-SA 2.1 Japan. Adapted by OrganUI.",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/teeth-3d/blob/f2cfe96f19dba7ec3982f2b06e6a34a1f6670450/public/models/ATTRIBUTION.md",
  },
}

export type TeethProps = Omit<OrganViewerProps, "model">

export function Teeth(props: TeethProps) {
  return <OrganViewer model={teethModel} {...props} />
}
