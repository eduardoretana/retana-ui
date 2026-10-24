import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Built in this repository by models/nerves/prepare.ts and served by the
// OrganUI website; see attribution.source.
export const nervesModel: OrganModel = {
  name: "Nerves",
  src: "https://organui.com/models/nerves.glb",
  bytes: 3478352,
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
      name: "Head and neck",
      direction: [0.5, 0, 1],
      structureIds: [
        "olfactory-nerves",
        "optic-nerves",
        "oculomotor-nerves",
        "trochlear-nerves",
        "trigeminal-nerves",
        "abducens-nerves",
        "facial-nerves",
        "vestibulocochlear-nerves",
        "glossopharyngeal-nerves",
        "hypoglossal-nerves",
      ],
    },
    {
      name: "Arms",
      direction: [0, 0, 1],
      structureIds: [
        "brachial-plexus",
        "axillary-nerves",
        "musculocutaneous-nerves",
        "radial-nerves",
        "median-nerves",
        "ulnar-nerves",
        "medial-cutaneous-nerves",
      ],
    },
    {
      name: "Legs",
      direction: [0, 0, 1],
      structureIds: [
        "femoral-nerves",
        "lateral-femoral-cutaneous-nerves",
        "obturator-nerves",
        "sciatic-nerves",
        "tibial-nerves",
        "common-fibular-nerves",
      ],
    },
  ],
  structures: [
    {
      id: "olfactory-nerves",
      label: "Olfactory nerves (I)",
      group: "Cranial nerves",
      color: "#e8b84a",
      description:
        "Carry smell from the roof of the nasal cavity. Shown with the olfactory bulbs and tracts that run back under the frontal lobes.",
    },
    {
      id: "optic-nerves",
      label: "Optic nerves (II)",
      group: "Cranial nerves",
      color: "#d9973c",
      description:
        "Carry vision from each retina to the brain. They meet at the optic chiasm, where fibres from the inner half of each retina cross over.",
    },
    {
      id: "oculomotor-nerves",
      label: "Oculomotor nerves (III)",
      group: "Cranial nerves",
      color: "#e8b84a",
      description:
        "Move most of the eye muscles, lift the upper eyelid and narrow the pupil.",
    },
    {
      id: "trochlear-nerves",
      label: "Trochlear nerves (IV)",
      group: "Cranial nerves",
      color: "#d9973c",
      description:
        "The thinnest cranial nerves. Each works the superior oblique muscle, which turns the eye down and in.",
    },
    {
      id: "trigeminal-nerves",
      label: "Trigeminal nerves (V)",
      group: "Cranial nerves",
      color: "#e8b84a",
      description:
        "The main sensory nerves of the face, in three divisions: ophthalmic, maxillary and mandibular. The mandibular division also works the chewing muscles.",
    },
    {
      id: "abducens-nerves",
      label: "Abducens nerves (VI)",
      group: "Cranial nerves",
      color: "#d9973c",
      description:
        "Work the lateral rectus, which turns the eye outward. Their long path inside the skull makes them sensitive to raised pressure.",
    },
    {
      id: "facial-nerves",
      label: "Facial nerves (VII)",
      group: "Cranial nerves",
      color: "#e8b84a",
      description:
        "Work the muscles of facial expression. The chorda tympani branch carries taste from the front of the tongue.",
    },
    {
      id: "vestibulocochlear-nerves",
      label: "Vestibulocochlear nerves (VIII)",
      group: "Cranial nerves",
      color: "#d9973c",
      description:
        "Carry hearing from the cochlea and balance from the vestibular organs of the inner ear.",
    },
    {
      id: "glossopharyngeal-nerves",
      label: "Glossopharyngeal nerves (IX)",
      group: "Cranial nerves",
      color: "#e8b84a",
      description:
        "Carry taste and sensation from the back of the tongue and the throat, and help start swallowing.",
    },
    {
      id: "vagus-nerves",
      label: "Vagus nerves (X)",
      group: "Cranial nerves",
      color: "#d9973c",
      description:
        "The longest cranial nerves. They leave the skull and run down the neck into the chest and abdomen, slowing the heart and driving digestion.",
    },
    {
      id: "accessory-nerves",
      label: "Accessory nerves (XI)",
      group: "Cranial nerves",
      color: "#e8b84a",
      description:
        "Rise from the upper spinal cord, enter the skull and leave it again to work the sternocleidomastoid and trapezius muscles.",
    },
    {
      id: "hypoglossal-nerves",
      label: "Hypoglossal nerves (XII)",
      group: "Cranial nerves",
      color: "#d9973c",
      description: "Work the muscles of the tongue.",
    },
    {
      id: "spinal-nerve-roots",
      label: "Spinal nerve roots and ganglia",
      group: "Spinal roots",
      color: "#c9a86a",
      description:
        "Each spinal nerve forms from a front (motor) root and a back (sensory) root. The swelling on each back root, the spinal ganglion, holds the sensory cell bodies.",
    },
    {
      id: "cauda-equina",
      label: "Cauda equina",
      group: "Spinal roots",
      color: "#b38f52",
      description:
        "The bundle of lower nerve roots that runs down the spinal canal below the end of the cord, named for its likeness to a horse's tail.",
    },
    {
      id: "intercostal-nerves",
      label: "Intercostal nerves",
      group: "Chest and abdomen",
      color: "#e0c068",
      description:
        "The front branches of the thoracic spinal nerves. They run under each rib and supply the chest wall muscles and skin.",
    },
    {
      id: "sympathetic-trunks",
      label: "Sympathetic trunks",
      group: "Chest and abdomen",
      color: "#9fae5a",
      description:
        "Chains of ganglia beside the spine that carry the body's fight-or-flight signals to the organs, vessels and sweat glands.",
    },
    {
      id: "iliohypogastric-ilio-inguinal-nerves",
      label: "Iliohypogastric and ilio-inguinal nerves",
      group: "Chest and abdomen",
      color: "#cfa54a",
      description:
        "Branches of the first lumbar nerve that supply the lower abdominal wall, the groin and the skin over the hip.",
    },
    {
      id: "brachial-plexus",
      label: "Brachial plexuses",
      group: "Shoulder and arm",
      color: "#f0c45c",
      description:
        "A network formed by the lower four cervical nerves and the first thoracic nerve. Its roots, trunks, divisions and cords regroup into the nerves of the arm. Shown with the subclavian nerve.",
    },
    {
      id: "dorsal-scapular-nerves",
      label: "Dorsal scapular nerves",
      group: "Shoulder and arm",
      color: "#d6a546",
      description:
        "Supply the rhomboid muscles and levator scapulae, which pull the shoulder blade toward the spine and lift it.",
    },
    {
      id: "long-thoracic-nerves",
      label: "Long thoracic nerves",
      group: "Shoulder and arm",
      color: "#f0c45c",
      description:
        "Run down the side of the chest to serratus anterior. Injury lets the shoulder blade stick out, called a winged scapula.",
    },
    {
      id: "suprascapular-nerves",
      label: "Suprascapular nerves",
      group: "Shoulder and arm",
      color: "#d6a546",
      description:
        "Pass over the shoulder blade to supraspinatus and infraspinatus, two of the rotator cuff muscles.",
    },
    {
      id: "pectoral-nerves",
      label: "Pectoral nerves",
      group: "Shoulder and arm",
      color: "#f0c45c",
      description:
        "The lateral and medial pectoral nerves, which supply pectoralis major and minor.",
    },
    {
      id: "subscapular-nerves",
      label: "Subscapular nerves",
      group: "Shoulder and arm",
      color: "#d6a546",
      description:
        "Supply subscapularis and teres major on the front of the shoulder blade.",
    },
    {
      id: "thoracodorsal-nerves",
      label: "Thoracodorsal nerves",
      group: "Shoulder and arm",
      color: "#f0c45c",
      description: "Supply latissimus dorsi, the broad muscle of the back.",
    },
    {
      id: "axillary-nerves",
      label: "Axillary nerves",
      group: "Shoulder and arm",
      color: "#d6a546",
      description:
        "Wind around the neck of the humerus to deltoid and teres minor, and supply the skin over the shoulder.",
    },
    {
      id: "musculocutaneous-nerves",
      label: "Musculocutaneous nerves",
      group: "Shoulder and arm",
      color: "#f0c45c",
      description:
        "Supply the front muscles of the upper arm, which bend the elbow, then continue as the skin nerve of the outer forearm.",
    },
    {
      id: "radial-nerves",
      label: "Radial nerves",
      group: "Shoulder and arm",
      color: "#d6a546",
      description:
        "Spiral around the back of the humerus and supply the muscles that straighten the elbow, wrist and fingers.",
    },
    {
      id: "median-nerves",
      label: "Median nerves",
      group: "Shoulder and arm",
      color: "#f0c45c",
      description:
        "Run down the middle of the arm and through the carpal tunnel to the thumb side of the hand. Pressure in the tunnel causes carpal tunnel syndrome.",
    },
    {
      id: "ulnar-nerves",
      label: "Ulnar nerves",
      group: "Shoulder and arm",
      color: "#d6a546",
      description:
        "Pass behind the elbow, where they cause the funny bone feeling, and supply most of the small muscles of the hand.",
    },
    {
      id: "medial-cutaneous-nerves",
      label: "Medial cutaneous nerves of arm and forearm",
      group: "Shoulder and arm",
      color: "#f0c45c",
      description:
        "Skin nerves from the medial cord that supply the inner side of the arm and forearm.",
    },
    {
      id: "femoral-nerves",
      label: "Femoral nerves",
      group: "Hip and leg",
      color: "#e3b04f",
      description:
        "The largest branches of the lumbar plexus. They supply the muscles that straighten the knee, and their saphenous branch reaches the inner leg and foot.",
    },
    {
      id: "lateral-femoral-cutaneous-nerves",
      label: "Lateral femoral cutaneous nerves",
      group: "Hip and leg",
      color: "#c99640",
      description:
        "Supply the skin of the outer thigh. Compression near the hip bone causes burning thigh pain.",
    },
    {
      id: "obturator-nerves",
      label: "Obturator nerves",
      group: "Hip and leg",
      color: "#e3b04f",
      description:
        "Pass through the obturator foramen of the pelvis to the muscles that pull the thighs together.",
    },
    {
      id: "genitofemoral-nerves",
      label: "Genitofemoral nerves",
      group: "Hip and leg",
      color: "#c99640",
      description:
        "Run down the front of psoas and divide into a genital branch and a femoral branch for the skin of the upper thigh.",
    },
    {
      id: "superior-gluteal-nerves",
      label: "Superior gluteal nerves",
      group: "Hip and leg",
      color: "#e3b04f",
      description:
        "Supply gluteus medius and minimus, which keep the pelvis level when standing on one leg.",
    },
    {
      id: "hip-rotator-nerves",
      label: "Nerves to piriformis and quadratus femoris",
      group: "Hip and leg",
      color: "#c99640",
      description:
        "Small branches of the sacral plexus to the deep muscles that turn the thigh outward.",
    },
    {
      id: "posterior-femoral-cutaneous-nerves",
      label: "Posterior femoral cutaneous nerves",
      group: "Hip and leg",
      color: "#e3b04f",
      description:
        "Supply the skin of the back of the thigh and the buttock fold.",
    },
    {
      id: "pudendal-nerves",
      label: "Pudendal nerves",
      group: "Hip and leg",
      color: "#c99640",
      description:
        "Supply the perineum, the external genitals and the sphincters that keep urine and stool in.",
    },
    {
      id: "sciatic-nerves",
      label: "Sciatic nerves",
      group: "Hip and leg",
      color: "#e3b04f",
      description:
        "The thickest nerves in the body. Each leaves the pelvis below piriformis, supplies the hamstrings and divides above the knee into the tibial and common fibular nerves.",
    },
    {
      id: "tibial-nerves",
      label: "Tibial nerves",
      group: "Hip and leg",
      color: "#c99640",
      description:
        "Continue down the back of the leg to the calf muscles and the sole of the foot, where they divide into the plantar nerves. Shown with the sural nerve.",
    },
    {
      id: "common-fibular-nerves",
      label: "Common fibular nerves",
      group: "Hip and leg",
      color: "#e3b04f",
      description:
        "Wind around the neck of the fibula, where they are easily injured, and divide into deep and superficial branches that lift the foot and supply its top.",
    },
  ],
  attribution: {
    credit:
      "Z-Anatomy (CC BY-SA 4.0), based in part on BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 Japan). Adapted by OrganUI.",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source:
      "https://github.com/organui/organui/blob/master/models/nerves/ATTRIBUTION.md",
  },
}

export type NervesProps = Omit<OrganViewerProps, "model">

export function Nerves(props: NervesProps) {
  return <OrganViewer model={nervesModel} {...props} />
}
