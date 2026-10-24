import {
  OrganViewer,
  type OrganModel,
  type OrganViewerProps,
} from "@/registry/retana/ui/organ-viewer"

// Generated from organui/muscles-3d at 1c746c3. The GLB stays in that
// repository under its own licence; see attribution.source.
export const musclesModel: OrganModel = {
  name: "Muscles",
  src: "https://cdn.jsdelivr.net/gh/organui/muscles-3d@1c746c36d12a78c5f3fd452dbe5d29ae869cad04/public/models/muscles.glb",
  bytes: 5624592,
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
      id: "frontalis",
      label: "Frontalis",
      group: "Face and scalp",
      color: "#ae3d4c",
      description:
        "Raises the eyebrows and wrinkles the forehead. It is the front belly of the scalp muscle.",
    },
    {
      id: "occipitalis",
      label: "Occipitalis",
      group: "Face and scalp",
      color: "#be6061",
      description:
        "The back belly of the scalp muscle. It pulls the scalp backward over the skull.",
    },
    {
      id: "epicranial-aponeurosis",
      label: "Epicranial aponeurosis",
      group: "Face and scalp",
      color: "#d8c9a8",
      description:
        "A tough sheet of tendon over the top of the skull that joins the frontalis in front to the occipitalis behind.",
    },
    {
      id: "temporoparietalis",
      label: "Temporoparietalis",
      group: "Face and scalp",
      color: "#b35662",
      description:
        "A thin, variable sheet above the ear that helps tighten the scalp.",
    },
    {
      id: "orbicularis-oculi",
      label: "Orbicularis oculi",
      group: "Face and scalp",
      color: "#ca7274",
      description:
        "A ring of muscle around the eye. It closes the eyelids, gently in blinking and tightly in squinting.",
    },
    {
      id: "corrugator-supercilii",
      label: "Corrugator supercilii",
      group: "Face and scalp",
      color: "#ae483d",
      description:
        "Draws the eyebrows down and together, making vertical frown lines above the nose.",
    },
    {
      id: "procerus",
      label: "Procerus",
      group: "Face and scalp",
      color: "#be606c",
      description:
        "Pulls the skin between the eyebrows down, making horizontal wrinkles over the bridge of the nose.",
    },
    {
      id: "nasalis",
      label: "Nasalis",
      group: "Face and scalp",
      color: "#9b3133",
      description: "Compresses or flares the nostrils.",
    },
    {
      id: "depressor-septi-nasi",
      label: "Depressor septi nasi",
      group: "Face and scalp",
      color: "#b35f56",
      description: "Pulls the tip of the nose and the nasal septum downward.",
    },
    {
      id: "levator-labii-superioris-alaeque-nasi",
      label: "Levator labii superioris alaeque nasi",
      group: "Face and scalp",
      color: "#ca727e",
      description: "Lifts the upper lip and flares the nostril, as in a sneer.",
    },
    {
      id: "levator-labii-superioris",
      label: "Levator labii superioris",
      group: "Face and scalp",
      color: "#ae3d3f",
      description: "Raises the upper lip.",
    },
    {
      id: "zygomaticus-minor",
      label: "Zygomaticus minor",
      group: "Face and scalp",
      color: "#be6960",
      description: "Lifts the upper lip, helping to show the upper teeth.",
    },
    {
      id: "zygomaticus-major",
      label: "Zygomaticus major",
      group: "Face and scalp",
      color: "#9b313f",
      description:
        "The main smiling muscle. It draws the corner of the mouth up and out.",
    },
    {
      id: "levator-anguli-oris",
      label: "Levator anguli oris",
      group: "Face and scalp",
      color: "#b35658",
      description: "Raises the corner of the mouth.",
    },
    {
      id: "risorius",
      label: "Risorius",
      group: "Face and scalp",
      color: "#ca7b72",
      description: "Pulls the corner of the mouth sideways.",
    },
    {
      id: "orbicularis-oris",
      label: "Orbicularis oris",
      group: "Face and scalp",
      color: "#ae3d4c",
      description: "Encircles the mouth. It closes and purses the lips.",
    },
    {
      id: "buccinator",
      label: "Buccinator",
      group: "Face and scalp",
      color: "#be6061",
      description:
        "The muscle of the cheek. It presses the cheek against the teeth, keeping food between them while chewing, and helps in blowing.",
    },
    {
      id: "depressor-anguli-oris",
      label: "Depressor anguli oris",
      group: "Face and scalp",
      color: "#9b3c31",
      description: "Pulls the corner of the mouth down, as in frowning.",
    },
    {
      id: "depressor-labii-inferioris",
      label: "Depressor labii inferioris",
      group: "Face and scalp",
      color: "#b35662",
      description: "Draws the lower lip down and out.",
    },
    {
      id: "mentalis",
      label: "Mentalis",
      group: "Face and scalp",
      color: "#ca7274",
      description:
        "Raises and wrinkles the skin of the chin and pushes the lower lip forward, as in pouting.",
    },
    {
      id: "masseter",
      label: "Masseter",
      group: "Chewing",
      color: "#a75144",
      description:
        "The strongest chewing muscle. It runs from the cheekbone to the angle of the jaw and closes the mouth.",
    },
    {
      id: "temporalis",
      label: "Temporalis",
      group: "Chewing",
      color: "#c97254",
      description:
        "A fan-shaped muscle on the side of the skull. It closes the jaw and pulls it backward.",
    },
    {
      id: "medial-pterygoid",
      label: "Medial pterygoid",
      group: "Chewing",
      color: "#8d5c3f",
      description:
        "Lies inside the jaw. It helps close the mouth and moves the jaw from side to side.",
    },
    {
      id: "lateral-pterygoid",
      label: "Lateral pterygoid",
      group: "Chewing",
      color: "#bc5c4e",
      description:
        "Pulls the jaw forward and opens the mouth, and moves it side to side when grinding.",
    },
    {
      id: "platysma",
      label: "Platysma",
      group: "Neck",
      color: "#b2383c",
      description:
        "A broad, thin sheet under the skin of the neck. It tenses the neck skin and helps pull the mouth down.",
    },
    {
      id: "sternocleidomastoid",
      label: "Sternocleidomastoid",
      group: "Neck",
      color: "#b96b64",
      description:
        "Runs from the breastbone and collarbone to behind the ear. One side turns the head to the opposite side; both together bend the neck forward.",
    },
    {
      id: "digastric",
      label: "Digastric",
      group: "Neck",
      color: "#944a38",
      description:
        "A two-bellied muscle under the jaw. It opens the mouth and raises the hyoid bone in swallowing.",
    },
    {
      id: "stylohyoid",
      label: "Stylohyoid",
      group: "Neck",
      color: "#bf4a4e",
      description: "Pulls the hyoid bone up and back during swallowing.",
    },
    {
      id: "mylohyoid",
      label: "Mylohyoid",
      group: "Neck",
      color: "#c77c75",
      description:
        "Forms the floor of the mouth and raises it and the tongue when swallowing.",
    },
    {
      id: "geniohyoid",
      label: "Geniohyoid",
      group: "Neck",
      color: "#b25138",
      description: "Lies above the mylohyoid and pulls the hyoid bone forward.",
    },
    {
      id: "sternohyoid",
      label: "Sternohyoid",
      group: "Neck",
      color: "#b96467",
      description:
        "A strap muscle in the front of the neck that pulls the hyoid bone down after swallowing.",
    },
    {
      id: "omohyoid",
      label: "Omohyoid",
      group: "Neck",
      color: "#944038",
      description:
        "A long, thin strap muscle with two bellies that lowers the hyoid bone.",
    },
    {
      id: "sternothyroid",
      label: "Sternothyroid",
      group: "Neck",
      color: "#bf614a",
      description:
        "A strap muscle beneath the sternohyoid that pulls the larynx down.",
    },
    {
      id: "thyrohyoid",
      label: "Thyrohyoid",
      group: "Neck",
      color: "#c77578",
      description:
        "A short strap muscle that lowers the hyoid bone or raises the larynx.",
    },
    {
      id: "scalenus-anterior",
      label: "Scalenus anterior",
      group: "Neck",
      color: "#b24238",
      description:
        "Runs from the neck vertebrae to the first rib. It bends the neck and lifts the first rib in deep breathing.",
    },
    {
      id: "scalenus-medius",
      label: "Scalenus medius",
      group: "Neck",
      color: "#b97564",
      description:
        "The largest scalene. It bends the neck to the side and lifts the first rib.",
    },
    {
      id: "scalenus-posterior",
      label: "Scalenus posterior",
      group: "Neck",
      color: "#94383b",
      description:
        "The smallest scalene. It lifts the second rib and bends the neck sideways.",
    },
    {
      id: "longus-colli",
      label: "Longus colli",
      group: "Neck",
      color: "#bf544a",
      description:
        "Lies against the front of the neck vertebrae and bends the neck forward.",
    },
    {
      id: "longus-capitis",
      label: "Longus capitis",
      group: "Neck",
      color: "#c78675",
      description:
        "Runs up the front of the neck vertebrae to the skull and bends the head forward.",
    },
    {
      id: "rectus-capitis-anterior",
      label: "Rectus capitis anterior",
      group: "Neck",
      color: "#b2383c",
      description:
        "A short muscle under the skull that bends the head forward at the top joint of the neck.",
    },
    {
      id: "rectus-capitis-lateralis",
      label: "Rectus capitis lateralis",
      group: "Neck",
      color: "#b96b64",
      description:
        "A short muscle under the skull that tilts the head to the side.",
    },
    {
      id: "trapezius",
      label: "Trapezius",
      group: "Back",
      color: "#a24f49",
      description:
        "A large diamond-shaped muscle of the upper back and neck. It lifts, pulls back and lowers the shoulder blades and steadies the head.",
    },
    {
      id: "latissimus-dorsi",
      label: "Latissimus dorsi",
      group: "Back",
      color: "#c16f5c",
      description:
        "The broad muscle of the lower back. It pulls the arm down and back and rotates it inward, as in rowing or climbing.",
    },
    {
      id: "levator-scapulae",
      label: "Levator scapulae",
      group: "Back",
      color: "#975235",
      description:
        "Runs from the upper neck vertebrae to the shoulder blade and lifts it.",
    },
    {
      id: "rhomboid-major",
      label: "Rhomboid major",
      group: "Back",
      color: "#b85851",
      description:
        "Pulls the shoulder blade toward the spine and holds it against the chest wall.",
    },
    {
      id: "rhomboid-minor",
      label: "Rhomboid minor",
      group: "Back",
      color: "#d07e6c",
      description:
        "Above the rhomboid major. It pulls the shoulder blade toward the spine.",
    },
    {
      id: "serratus-posterior-superior",
      label: "Serratus posterior superior",
      group: "Back",
      color: "#a26349",
      description:
        "A thin muscle over the upper ribs at the back that may help lift them.",
    },
    {
      id: "serratus-posterior-inferior",
      label: "Serratus posterior inferior",
      group: "Back",
      color: "#c1635c",
      description:
        "A thin muscle over the lower ribs at the back that may help pull them down.",
    },
    {
      id: "splenius-capitis",
      label: "Splenius capitis",
      group: "Back",
      color: "#974735",
      description:
        "A broad strap at the back of the neck that extends and turns the head.",
    },
    {
      id: "splenius-cervicis",
      label: "Splenius cervicis",
      group: "Back",
      color: "#b87051",
      description: "Below the splenius capitis. It extends and turns the neck.",
    },
    {
      id: "iliocostalis",
      label: "Iliocostalis",
      group: "Back",
      color: "#d0726c",
      description:
        "The outer column of the erector spinae. It straightens the back and bends it to the side.",
    },
    {
      id: "longissimus",
      label: "Longissimus",
      group: "Back",
      color: "#a25949",
      description:
        "The middle and longest column of the erector spinae. It straightens the back and neck.",
    },
    {
      id: "spinalis",
      label: "Spinalis",
      group: "Back",
      color: "#c17b5c",
      description:
        "The inner column of the erector spinae, beside the spinous processes. It straightens the spine.",
    },
    {
      id: "semispinalis",
      label: "Semispinalis",
      group: "Back",
      color: "#973c35",
      description:
        "A deep muscle of the upper back and neck that extends the head and spine.",
    },
    {
      id: "multifidus",
      label: "Multifidus",
      group: "Back",
      color: "#b86451",
      description:
        "Short bundles along the spine that steady the vertebrae, especially in the lower back.",
    },
    {
      id: "rotatores",
      label: "Rotatores",
      group: "Back",
      color: "#d08a6c",
      description:
        "The deepest small muscles of the back. They steady and rotate the vertebrae.",
    },
    {
      id: "interspinales",
      label: "Interspinales",
      group: "Back",
      color: "#a24f49",
      description:
        "Small muscles between the spinous processes of neighbouring vertebrae. They help extend the spine.",
    },
    {
      id: "intertransversarii",
      label: "Intertransversarii",
      group: "Back",
      color: "#c16f5c",
      description:
        "Small muscles between the transverse processes of neighbouring vertebrae. They help bend the spine sideways.",
    },
    {
      id: "levatores-costarum",
      label: "Levatores costarum",
      group: "Back",
      color: "#975235",
      description:
        "Small muscles from the vertebrae to the ribs below that lift the ribs.",
    },
    {
      id: "rectus-capitis-posterior-major",
      label: "Rectus capitis posterior major",
      group: "Back",
      color: "#b85851",
      description:
        "A suboccipital muscle under the base of the skull that extends and turns the head.",
    },
    {
      id: "rectus-capitis-posterior-minor",
      label: "Rectus capitis posterior minor",
      group: "Back",
      color: "#d07e6c",
      description: "A small suboccipital muscle that extends the head.",
    },
    {
      id: "obliquus-capitis-superior",
      label: "Obliquus capitis superior",
      group: "Back",
      color: "#a26349",
      description:
        "A suboccipital muscle that extends the head and tilts it to the side.",
    },
    {
      id: "obliquus-capitis-inferior",
      label: "Obliquus capitis inferior",
      group: "Back",
      color: "#c1635c",
      description:
        "A suboccipital muscle that turns the head at the joint between the first two vertebrae.",
    },
    {
      id: "pectoralis-major",
      label: "Pectoralis major",
      group: "Chest",
      color: "#aa4152",
      description:
        "The large fan-shaped chest muscle. It draws the arm across the body and rotates it inward.",
    },
    {
      id: "pectoralis-minor",
      label: "Pectoralis minor",
      group: "Chest",
      color: "#c5595e",
      description:
        "Lies under the pectoralis major. It pulls the shoulder blade forward and down.",
    },
    {
      id: "subclavius",
      label: "Subclavius",
      group: "Chest",
      color: "#91413b",
      description: "A small muscle under the collarbone that steadies it.",
    },
    {
      id: "serratus-anterior",
      label: "Serratus anterior",
      group: "Chest",
      color: "#c4455a",
      description:
        "Wraps around the side of the chest from the ribs to the shoulder blade. It pulls the shoulder blade forward, as in punching or pushing.",
    },
    {
      id: "external-intercostals",
      label: "External intercostals",
      group: "Chest",
      color: "#c3797d",
      description:
        "The outer layer between the ribs. They lift the ribs when breathing in.",
    },
    {
      id: "internal-intercostals",
      label: "Internal intercostals",
      group: "Chest",
      color: "#aa4841",
      description:
        "The middle layer between the ribs. They help pull the ribs down when breathing out forcefully.",
    },
    {
      id: "innermost-intercostals",
      label: "Innermost intercostals",
      group: "Chest",
      color: "#c5596b",
      description:
        "The deepest layer between the ribs, working with the internal intercostals.",
    },
    {
      id: "transversus-thoracis",
      label: "Transversus thoracis",
      group: "Chest",
      color: "#913b3f",
      description:
        "A thin muscle on the inside of the front chest wall that helps pull the ribs down.",
    },
    {
      id: "diaphragm",
      label: "Diaphragm",
      group: "Chest",
      color: "#c44d45",
      description:
        "The dome-shaped main muscle of breathing. It separates the chest from the abdomen and flattens to draw air into the lungs.",
    },
    {
      id: "rectus-abdominis",
      label: "Rectus abdominis",
      group: "Abdomen",
      color: "#ae543d",
      description:
        "The paired vertical muscle at the front of the abdomen. It bends the trunk forward and supports the abdominal wall.",
    },
    {
      id: "pyramidalis",
      label: "Pyramidalis",
      group: "Abdomen",
      color: "#be7e60",
      description:
        "A small triangular muscle at the lower end of the rectus abdominis. It tenses the linea alba.",
    },
    {
      id: "linea-alba",
      label: "Linea alba",
      group: "Abdomen",
      color: "#d8c9a8",
      description:
        "A band of tendon down the midline of the abdomen where the flat abdominal muscles meet.",
    },
    {
      id: "external-oblique",
      label: "External oblique",
      group: "Abdomen",
      color: "#b36956",
      description:
        "The outermost flat muscle on the side of the abdomen. It bends and turns the trunk and compresses the abdomen.",
    },
    {
      id: "internal-oblique",
      label: "Internal oblique",
      group: "Abdomen",
      color: "#ca8e72",
      description:
        "Beneath the external oblique, with fibres running the other way. It bends and turns the trunk.",
    },
    {
      id: "transversus-abdominis",
      label: "Transversus abdominis",
      group: "Abdomen",
      color: "#ae6e3d",
      description:
        "The deepest flat abdominal muscle. Its fibres run around the abdomen like a belt and compress it.",
    },
    {
      id: "quadratus-lumborum",
      label: "Quadratus lumborum",
      group: "Abdomen",
      color: "#be7360",
      description:
        "Runs from the pelvis to the lowest rib in the back wall of the abdomen. It bends the trunk sideways and steadies the lowest rib.",
    },
    {
      id: "pubococcygeus",
      label: "Pubococcygeus",
      group: "Pelvic floor",
      color: "#a7445d",
      description:
        "Part of the levator ani. It runs from the pubic bone to the tailbone and supports the pelvic organs.",
    },
    {
      id: "puborectalis",
      label: "Puborectalis",
      group: "Pelvic floor",
      color: "#c95464",
      description:
        "Part of the levator ani. It forms a sling around the rectum that helps keep it closed.",
    },
    {
      id: "iliococcygeus",
      label: "Iliococcygeus",
      group: "Pelvic floor",
      color: "#8d3f41",
      description:
        "The back part of the levator ani, forming much of the pelvic floor.",
    },
    {
      id: "coccygeus",
      label: "Coccygeus",
      group: "Pelvic floor",
      color: "#bc4e69",
      description:
        "A small muscle behind the levator ani that supports the pelvic floor and the tailbone.",
    },
    {
      id: "external-anal-sphincter",
      label: "External anal sphincter",
      group: "Pelvic floor",
      color: "#cd707c",
      description:
        "A ring of muscle around the anal canal under voluntary control.",
    },
    {
      id: "deltoid",
      label: "Deltoid",
      group: "Shoulder",
      color: "#b24538",
      description:
        "The rounded muscle over the shoulder. It lifts the arm to the front, to the side and to the back.",
    },
    {
      id: "supraspinatus",
      label: "Supraspinatus",
      group: "Shoulder",
      color: "#b97764",
      description:
        "A rotator cuff muscle above the spine of the shoulder blade. It starts lifting the arm to the side and steadies the shoulder joint.",
    },
    {
      id: "infraspinatus",
      label: "Infraspinatus",
      group: "Shoulder",
      color: "#945738",
      description:
        "A rotator cuff muscle below the spine of the shoulder blade. It rotates the arm outward.",
    },
    {
      id: "teres-minor",
      label: "Teres minor",
      group: "Shoulder",
      color: "#bf564a",
      description: "A small rotator cuff muscle that rotates the arm outward.",
    },
    {
      id: "teres-major",
      label: "Teres major",
      group: "Shoulder",
      color: "#c78775",
      description:
        "Runs from the lower shoulder blade to the upper arm. It pulls the arm down and back and rotates it inward.",
    },
    {
      id: "subscapularis",
      label: "Subscapularis",
      group: "Shoulder",
      color: "#b26138",
      description:
        "The rotator cuff muscle on the front of the shoulder blade. It rotates the arm inward.",
    },
    {
      id: "biceps-brachii",
      label: "Biceps brachii",
      group: "Upper arm",
      color: "#a24950",
      description:
        "The two-headed muscle at the front of the upper arm. It bends the elbow and turns the palm up.",
    },
    {
      id: "brachialis",
      label: "Brachialis",
      group: "Upper arm",
      color: "#c1605c",
      description:
        "Lies under the biceps and is the main muscle that bends the elbow.",
    },
    {
      id: "coracobrachialis",
      label: "Coracobrachialis",
      group: "Upper arm",
      color: "#974435",
      description:
        "A small muscle on the inner upper arm that draws the arm forward and toward the body.",
    },
    {
      id: "triceps-brachii",
      label: "Triceps brachii",
      group: "Upper arm",
      color: "#b8515a",
      description:
        "The three-headed muscle at the back of the upper arm. It straightens the elbow.",
    },
    {
      id: "anconeus",
      label: "Anconeus",
      group: "Upper arm",
      color: "#d06f6c",
      description: "A small muscle behind the elbow that helps straighten it.",
    },
    {
      id: "brachioradialis",
      label: "Brachioradialis",
      group: "Forearm",
      color: "#aa5241",
      description:
        "Runs along the thumb side of the forearm and bends the elbow, especially with the thumb up.",
    },
    {
      id: "pronator-teres",
      label: "Pronator teres",
      group: "Forearm",
      color: "#c57759",
      description: "Turns the palm down and helps bend the elbow.",
    },
    {
      id: "flexor-carpi-radialis",
      label: "Flexor carpi radialis",
      group: "Forearm",
      color: "#915d3b",
      description: "Bends the wrist and tilts the hand toward the thumb.",
    },
    {
      id: "palmaris-longus",
      label: "Palmaris longus",
      group: "Forearm",
      color: "#c45a45",
      description:
        "A slender muscle with a long tendon that tenses the palm. It is absent in some people.",
    },
    {
      id: "flexor-carpi-ulnaris",
      label: "Flexor carpi ulnaris",
      group: "Forearm",
      color: "#c38e79",
      description:
        "Bends the wrist and tilts the hand toward the little finger.",
    },
    {
      id: "flexor-digitorum-superficialis",
      label: "Flexor digitorum superficialis",
      group: "Forearm",
      color: "#aa6b41",
      description: "Bends the middle joints of the four fingers.",
    },
    {
      id: "flexor-digitorum-profundus",
      label: "Flexor digitorum profundus",
      group: "Forearm",
      color: "#c56b59",
      description:
        "A deep forearm muscle that bends the end joints of the four fingers.",
    },
    {
      id: "flexor-pollicis-longus",
      label: "Flexor pollicis longus",
      group: "Forearm",
      color: "#91533b",
      description: "Bends the end joint of the thumb.",
    },
    {
      id: "pronator-quadratus",
      label: "Pronator quadratus",
      group: "Forearm",
      color: "#c47845",
      description:
        "A square muscle above the wrist and the main muscle that turns the palm down.",
    },
    {
      id: "supinator",
      label: "Supinator",
      group: "Forearm",
      color: "#c38679",
      description: "Wraps around the upper radius and turns the palm up.",
    },
    {
      id: "extensor-carpi-radialis-longus",
      label: "Extensor carpi radialis longus",
      group: "Forearm",
      color: "#aa5e41",
      description: "Extends the wrist and tilts the hand toward the thumb.",
    },
    {
      id: "extensor-carpi-radialis-brevis",
      label: "Extensor carpi radialis brevis",
      group: "Forearm",
      color: "#c58459",
      description: "Extends the wrist, working with the longus.",
    },
    {
      id: "extensor-digitorum",
      label: "Extensor digitorum",
      group: "Forearm",
      color: "#91493b",
      description: "Straightens the four fingers and helps extend the wrist.",
    },
    {
      id: "extensor-digiti-minimi",
      label: "Extensor digiti minimi",
      group: "Forearm",
      color: "#c46945",
      description: "Straightens the little finger.",
    },
    {
      id: "extensor-carpi-ulnaris",
      label: "Extensor carpi ulnaris",
      group: "Forearm",
      color: "#c39779",
      description:
        "Extends the wrist and tilts the hand toward the little finger.",
    },
    {
      id: "abductor-pollicis-longus",
      label: "Abductor pollicis longus",
      group: "Forearm",
      color: "#aa5241",
      description:
        "Moves the thumb away from the palm and helps tilt the wrist toward the thumb.",
    },
    {
      id: "extensor-pollicis-brevis",
      label: "Extensor pollicis brevis",
      group: "Forearm",
      color: "#c57759",
      description: "Straightens the base of the thumb.",
    },
    {
      id: "extensor-pollicis-longus",
      label: "Extensor pollicis longus",
      group: "Forearm",
      color: "#915d3b",
      description: "Straightens the end joint of the thumb.",
    },
    {
      id: "extensor-indicis",
      label: "Extensor indicis",
      group: "Forearm",
      color: "#c45a45",
      description: "Straightens the index finger, as in pointing.",
    },
    {
      id: "abductor-pollicis-brevis",
      label: "Abductor pollicis brevis",
      group: "Hand",
      color: "#ae3d54",
      description:
        "Part of the ball of the thumb. It moves the thumb away from the palm.",
    },
    {
      id: "flexor-pollicis-brevis",
      label: "Flexor pollicis brevis",
      group: "Hand",
      color: "#be6068",
      description:
        "Part of the ball of the thumb. It bends the thumb at its base.",
    },
    {
      id: "opponens-pollicis",
      label: "Opponens pollicis",
      group: "Hand",
      color: "#9b3431",
      description:
        "Part of the ball of the thumb. It brings the thumb across the palm to touch the fingers.",
    },
    {
      id: "adductor-pollicis",
      label: "Adductor pollicis",
      group: "Hand",
      color: "#b35669",
      description:
        "A deep muscle of the palm that draws the thumb toward the hand, as in gripping.",
    },
    {
      id: "abductor-digiti-minimi-hand",
      label: "Abductor digiti minimi (hand)",
      group: "Hand",
      color: "#ca727a",
      description:
        "Part of the pad below the little finger. It spreads the little finger away from the others.",
    },
    {
      id: "flexor-digiti-minimi-brevis-hand",
      label: "Flexor digiti minimi brevis (hand)",
      group: "Hand",
      color: "#ae413d",
      description:
        "Part of the pad below the little finger. It bends the little finger at its base.",
    },
    {
      id: "opponens-digiti-minimi-hand",
      label: "Opponens digiti minimi (hand)",
      group: "Hand",
      color: "#be6073",
      description:
        "Part of the pad below the little finger. It draws the little finger toward the thumb and cups the palm.",
    },
    {
      id: "lumbricals-hand",
      label: "Lumbricals (hand)",
      group: "Hand",
      color: "#9b313a",
      description:
        "Four small muscles on the tendons in the palm. They bend the knuckles while straightening the finger joints.",
    },
    {
      id: "palmar-interossei",
      label: "Palmar interossei",
      group: "Hand",
      color: "#b35956",
      description:
        "Small muscles between the bones of the palm that draw the fingers together.",
    },
    {
      id: "dorsal-interossei-hand",
      label: "Dorsal interossei (hand)",
      group: "Hand",
      color: "#ca7284",
      description:
        "Small muscles between the bones of the hand that spread the fingers apart.",
    },
    {
      id: "iliacus",
      label: "Iliacus",
      group: "Hip",
      color: "#a74744",
      description:
        "Fills the inside of the hip bone. With the psoas major it forms the iliopsoas, the strongest hip flexor.",
    },
    {
      id: "psoas-major",
      label: "Psoas major",
      group: "Hip",
      color: "#c96654",
      description:
        "A long muscle beside the lumbar spine that bends the hip and lifts the thigh.",
    },
    {
      id: "gluteus-maximus",
      label: "Gluteus maximus",
      group: "Hip",
      color: "#8d543f",
      description:
        "The largest muscle of the buttock. It extends the hip, as in climbing stairs or rising from a chair.",
    },
    {
      id: "gluteus-medius",
      label: "Gluteus medius",
      group: "Hip",
      color: "#bc514e",
      description:
        "Lies under the gluteus maximus. It moves the thigh out to the side and keeps the pelvis level when walking.",
    },
    {
      id: "gluteus-minimus",
      label: "Gluteus minimus",
      group: "Hip",
      color: "#cd7e70",
      description:
        "The deepest gluteal muscle. It works with the gluteus medius.",
    },
    {
      id: "tensor-fasciae-latae",
      label: "Tensor fasciae latae",
      group: "Hip",
      color: "#a75e44",
      description:
        "A short muscle at the front of the hip that tenses the iliotibial band and helps bend and abduct the hip.",
    },
    {
      id: "piriformis",
      label: "Piriformis",
      group: "Hip",
      color: "#c95854",
      description:
        "A pear-shaped muscle from the sacrum to the top of the thigh bone. It rotates the thigh outward.",
    },
    {
      id: "gemellus-superior",
      label: "Gemellus superior",
      group: "Hip",
      color: "#8d4b3f",
      description:
        "A small muscle above the obturator internus tendon that rotates the thigh outward.",
    },
    {
      id: "obturator-internus",
      label: "Obturator internus",
      group: "Hip",
      color: "#bc6b4e",
      description:
        "Runs from inside the pelvis around the hip bone to the thigh. It rotates the thigh outward.",
    },
    {
      id: "gemellus-inferior",
      label: "Gemellus inferior",
      group: "Hip",
      color: "#cd7370",
      description:
        "A small muscle below the obturator internus tendon that rotates the thigh outward.",
    },
    {
      id: "quadratus-femoris",
      label: "Quadratus femoris",
      group: "Hip",
      color: "#a75344",
      description:
        "A flat, square muscle below the gemelli that rotates the thigh outward.",
    },
    {
      id: "obturator-externus",
      label: "Obturator externus",
      group: "Hip",
      color: "#c97454",
      description:
        "Covers the outside of the pelvic opening and rotates the thigh outward.",
    },
    {
      id: "sartorius",
      label: "Sartorius",
      group: "Thigh",
      color: "#b2383e",
      description:
        "The longest muscle in the body. It crosses the front of the thigh and bends both hip and knee, as when sitting cross-legged.",
    },
    {
      id: "rectus-femoris",
      label: "Rectus femoris",
      group: "Thigh",
      color: "#b96a64",
      description:
        "The part of the quadriceps that crosses the hip. It straightens the knee and helps bend the hip.",
    },
    {
      id: "vastus-lateralis",
      label: "Vastus lateralis",
      group: "Thigh",
      color: "#944938",
      description:
        "The largest part of the quadriceps, on the outer thigh. It straightens the knee.",
    },
    {
      id: "vastus-medialis",
      label: "Vastus medialis",
      group: "Thigh",
      color: "#bf4a50",
      description:
        "The part of the quadriceps on the inner thigh, bulging above the knee. It straightens the knee.",
    },
    {
      id: "vastus-intermedius",
      label: "Vastus intermedius",
      group: "Thigh",
      color: "#c77b75",
      description:
        "The deep part of the quadriceps, under the rectus femoris. It straightens the knee.",
    },
    {
      id: "pectineus",
      label: "Pectineus",
      group: "Thigh",
      color: "#b24f38",
      description:
        "A flat muscle at the top of the inner thigh that bends the hip and draws the thigh inward.",
    },
    {
      id: "adductor-longus",
      label: "Adductor longus",
      group: "Thigh",
      color: "#b96468",
      description: "Draws the thigh inward and helps bend the hip.",
    },
    {
      id: "adductor-brevis",
      label: "Adductor brevis",
      group: "Thigh",
      color: "#943e38",
      description:
        "Lies behind the adductor longus and draws the thigh inward.",
    },
    {
      id: "adductor-magnus",
      label: "Adductor magnus",
      group: "Thigh",
      color: "#bf5f4a",
      description:
        "The largest adductor. It draws the thigh inward, and its hamstring part helps extend the hip.",
    },
    {
      id: "adductor-minimus",
      label: "Adductor minimus",
      group: "Thigh",
      color: "#c77579",
      description:
        "The upper part of the adductor magnus, sometimes described separately. It draws the thigh inward.",
    },
    {
      id: "gracilis",
      label: "Gracilis",
      group: "Thigh",
      color: "#b24038",
      description:
        "A long, thin muscle on the inner thigh that draws the thigh inward and bends the knee.",
    },
    {
      id: "biceps-femoris",
      label: "Biceps femoris",
      group: "Thigh",
      color: "#b97464",
      description:
        "The outer hamstring, with two heads. It bends the knee and extends the hip.",
    },
    {
      id: "semitendinosus",
      label: "Semitendinosus",
      group: "Thigh",
      color: "#94383d",
      description:
        "An inner hamstring with a long tendon. It bends the knee and extends the hip.",
    },
    {
      id: "semimembranosus",
      label: "Semimembranosus",
      group: "Thigh",
      color: "#bf524a",
      description:
        "The deepest inner hamstring. It bends the knee and extends the hip.",
    },
    {
      id: "tibialis-anterior",
      label: "Tibialis anterior",
      group: "Lower leg",
      color: "#a25e49",
      description:
        "Runs down the front of the shin. It lifts the foot and turns the sole inward.",
    },
    {
      id: "extensor-hallucis-longus",
      label: "Extensor hallucis longus",
      group: "Lower leg",
      color: "#c1805c",
      description: "Straightens the big toe and helps lift the foot.",
    },
    {
      id: "extensor-digitorum-longus",
      label: "Extensor digitorum longus",
      group: "Lower leg",
      color: "#976335",
      description: "Straightens the four small toes and helps lift the foot.",
    },
    {
      id: "fibularis-tertius",
      label: "Fibularis tertius",
      group: "Lower leg",
      color: "#b86951",
      description:
        "A small muscle at the front of the lower leg that lifts the foot and turns the sole outward.",
    },
    {
      id: "fibularis-longus",
      label: "Fibularis longus",
      group: "Lower leg",
      color: "#d08f6c",
      description:
        "Runs down the outer leg and under the foot. It points the foot and turns the sole outward.",
    },
    {
      id: "fibularis-brevis",
      label: "Fibularis brevis",
      group: "Lower leg",
      color: "#a27249",
      description: "Beneath the fibularis longus. It turns the sole outward.",
    },
    {
      id: "gastrocnemius",
      label: "Gastrocnemius",
      group: "Lower leg",
      color: "#c1745c",
      description:
        "The two-headed calf muscle. It points the foot and helps bend the knee.",
    },
    {
      id: "soleus",
      label: "Soleus",
      group: "Lower leg",
      color: "#975735",
      description:
        "A broad, flat muscle under the gastrocnemius. It points the foot and steadies the leg when standing.",
    },
    {
      id: "plantaris",
      label: "Plantaris",
      group: "Lower leg",
      color: "#b88151",
      description:
        "A small muscle with a very long, thin tendon behind the knee and calf. It assists the gastrocnemius.",
    },
    {
      id: "calcaneal-tendon",
      label: "Calcaneal (Achilles) tendon",
      group: "Lower leg",
      color: "#d8c9a8",
      description:
        "The Achilles tendon. It joins the gastrocnemius and soleus to the heel bone and is the strongest tendon in the body.",
    },
    {
      id: "popliteus",
      label: "Popliteus",
      group: "Lower leg",
      color: "#a26849",
      description:
        "A small muscle behind the knee that unlocks the straightened knee by rotating the leg.",
    },
    {
      id: "flexor-digitorum-longus",
      label: "Flexor digitorum longus",
      group: "Lower leg",
      color: "#c18b5c",
      description:
        "A deep calf muscle that bends the four small toes and helps point the foot.",
    },
    {
      id: "flexor-hallucis-longus",
      label: "Flexor hallucis longus",
      group: "Lower leg",
      color: "#974c35",
      description:
        "A deep calf muscle that bends the big toe and helps push off when walking.",
    },
    {
      id: "tibialis-posterior",
      label: "Tibialis posterior",
      group: "Lower leg",
      color: "#b87551",
      description:
        "The deepest calf muscle. It points the foot, turns the sole inward and supports the arch.",
    },
    {
      id: "extensor-digitorum-brevis",
      label: "Extensor digitorum brevis",
      group: "Foot",
      color: "#aa4141",
      description:
        "A small muscle on the top of the foot that straightens the toes.",
    },
    {
      id: "extensor-hallucis-brevis",
      label: "Extensor hallucis brevis",
      group: "Foot",
      color: "#c56659",
      description:
        "A small muscle on the top of the foot that straightens the big toe.",
    },
    {
      id: "abductor-hallucis",
      label: "Abductor hallucis",
      group: "Foot",
      color: "#914f3b",
      description:
        "Runs along the inner edge of the sole and moves the big toe away from the others.",
    },
    {
      id: "flexor-digitorum-brevis",
      label: "Flexor digitorum brevis",
      group: "Foot",
      color: "#c44545",
      description:
        "Lies in the middle of the sole and bends the four small toes.",
    },
    {
      id: "abductor-digiti-minimi-foot",
      label: "Abductor digiti minimi (foot)",
      group: "Foot",
      color: "#c38279",
      description:
        "Runs along the outer edge of the sole and moves the little toe outward.",
    },
    {
      id: "quadratus-plantae",
      label: "Quadratus plantae",
      group: "Foot",
      color: "#aa5941",
      description:
        "A flat muscle in the sole that straightens the pull of the long toe flexor.",
    },
    {
      id: "lumbricals-foot",
      label: "Lumbricals (foot)",
      group: "Foot",
      color: "#c55959",
      description:
        "Four small muscles in the sole that bend the toes at their bases.",
    },
    {
      id: "flexor-hallucis-brevis",
      label: "Flexor hallucis brevis",
      group: "Foot",
      color: "#91453b",
      description:
        "A short muscle in the sole that bends the big toe at its base.",
    },
    {
      id: "adductor-hallucis",
      label: "Adductor hallucis",
      group: "Foot",
      color: "#c46345",
      description:
        "A deep muscle of the sole with two heads that draws the big toe toward the others.",
    },
    {
      id: "flexor-digiti-minimi-brevis-foot",
      label: "Flexor digiti minimi brevis (foot)",
      group: "Foot",
      color: "#c37979",
      description: "Bends the little toe at its base.",
    },
    {
      id: "opponens-digiti-minimi-foot",
      label: "Opponens digiti minimi (foot)",
      group: "Foot",
      color: "#aa4d41",
      description:
        "A small, inconstant slip in the sole that draws the fifth metatarsal inward.",
    },
    {
      id: "plantar-interossei",
      label: "Plantar interossei",
      group: "Foot",
      color: "#c57259",
      description:
        "Small muscles between the bones of the sole that draw the toes together.",
    },
    {
      id: "dorsal-interossei-foot",
      label: "Dorsal interossei (foot)",
      group: "Foot",
      color: "#913b3b",
      description:
        "Small muscles between the bones of the foot that spread the toes apart.",
    },
  ],
  attribution: {
    credit:
      "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
    source:
      "https://github.com/organui/muscles-3d/blob/1c746c36d12a78c5f3fd452dbe5d29ae869cad04/public/models/ATTRIBUTION.md",
  },
}

export type MusclesProps = Omit<OrganViewerProps, "model">

export function Muscles(props: MusclesProps) {
  return <OrganViewer model={musclesModel} {...props} />
}
