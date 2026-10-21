import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/skin-3d at 0e29b30. The GLB stays in that
// repository under its own licence; see attribution.source.
export const skinModel: OrganModel = {
  name: "Skin",
  src: "https://cdn.jsdelivr.net/gh/organui/skin-3d@0e29b3087641e269183f1ecef7a997e412b584fb/public/models/skin.glb",
  bytes: 3537896,
  defaultView: "Oblique",
  views: [
    {
      name: "Oblique",
      direction: [0.55, 0.55, 1],
    },
    {
      name: "Cross-section",
      direction: [0, 0, 1],
    },
    {
      name: "Surface",
      direction: [0, 1, 0.7],
    },
  ],
  structures: [
    {
      id: "epidermis",
      label: "Epidermis",
      group: "Skin layers",
      tone: "chart-1", shade: 0.15,
      description:
        "The thin outer layer of the skin. It renews itself constantly and forms a barrier against water loss and infection.",
    },
    {
      id: "papillary-dermis",
      label: "Papillary dermis",
      group: "Skin layers",
      tone: "chart-1", shade: 0.22,
      description:
        "The thin upper part of the dermis. Its finger-like papillae interlock with the epidermis and carry capillary loops close to the surface.",
    },
    {
      id: "reticular-dermis",
      label: "Reticular dermis",
      group: "Skin layers",
      tone: "chart-1", shade: 0.14,
      description:
        "The thick, dense lower part of the dermis. Its collagen and elastic fibres give skin strength and stretch, and it houses hair follicles and glands.",
    },
    {
      id: "hypodermis",
      label: "Hypodermis",
      group: "Skin layers",
      tone: "chart-2", shade: 0.21,
      description:
        "The subcutaneous layer beneath the dermis. Mostly fat, it insulates, cushions and anchors the skin to the tissue below.",
    },
    {
      id: "hair-shaft",
      label: "Hair shaft",
      group: "Hair and glands",
      tone: "chart-2", shade: -0.18,
      description:
        "The keratinised strand of hair. It grows from the bulb at the base of the follicle and emerges through the epidermis.",
    },
    {
      id: "hair-follicle",
      label: "Hair follicle",
      group: "Hair and glands",
      tone: "chart-1", shade: 0.04,
      description:
        "A tube of epidermal cells reaching down into the dermis. Its swollen base, the bulb, produces the growing hair.",
    },
    {
      id: "sebaceous-gland",
      label: "Sebaceous gland",
      group: "Hair and glands",
      tone: "chart-3", shade: 0.05,
      description:
        "Small lobed glands that open into the hair follicle and release sebum, an oily secretion that softens hair and skin.",
    },
    {
      id: "arrector-pili",
      label: "Arrector pili muscle",
      group: "Hair and glands",
      tone: "chart-1", shade: 0.01,
      description:
        "A small band of smooth muscle from the follicle to the upper dermis. When it contracts the hair stands up, giving goosebumps.",
    },
    {
      id: "sweat-gland",
      label: "Eccrine sweat gland",
      group: "Hair and glands",
      tone: "chart-3", shade: 0.08,
      description:
        "A coiled tube deep in the dermis that secretes sweat. Its duct spirals up through the epidermis to a pore on the surface.",
    },
    {
      id: "arteries",
      label: "Cutaneous arteries",
      group: "Vessels and nerves",
      tone: "chart-1", shade: 0.0,
      description:
        "Arteries form a deep plexus where the dermis meets the hypodermis and a superficial plexus in the upper dermis, which sends capillary loops into the papillae.",
    },
    {
      id: "veins",
      label: "Cutaneous veins",
      group: "Vessels and nerves",
      tone: "chart-4", shade: 0.04,
      description:
        "Veins run beside the arteries in the same two plexuses and carry blood back out of the skin.",
    },
    {
      id: "nerve",
      label: "Cutaneous nerve",
      group: "Vessels and nerves",
      tone: "chart-2", shade: 0.01,
      description:
        "Sensory nerve fibres rise through the hypodermis and dermis, ending freely or in receptors that detect touch, pressure, pain and temperature.",
    },
    {
      id: "lamellar-corpuscle",
      label: "Lamellar corpuscle",
      group: "Vessels and nerves",
      tone: "chart-5", shade: 0.16,
      description:
        "Also called a Pacinian corpuscle. A layered, onion-like receptor deep in the skin that responds to pressure and vibration.",
    },
  ],
  attribution: {
    credit:
      "OrganUI Skin schematic model, dedicated to the public domain under CC0 1.0",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    source:
      "https://github.com/organui/skin-3d/blob/0e29b3087641e269183f1ecef7a997e412b584fb/public/models/ATTRIBUTION.md",
  },
}

export type SkinProps = Omit<OrganViewerProps, "model">

export function Skin(props: SkinProps) {
  return <OrganViewer model={skinModel} {...props} />
}
