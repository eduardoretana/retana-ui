/** Adapted from Arc UI (MIT). */

/** One story teased in an issue. `image` is a small square thumbnail when you have one. */
export interface NewsletterStory {
  title: string
  image?: string
  minutes: number
}

/** One issue of the newsletter, as it appears on the stack. */
export interface NewsletterIssue {
  number: number
  /** Send date as it should read, such as "Friday, September 25". */
  date: string
  subject: string
  /** Up to three stories. */
  stories: NewsletterStory[]
}

/** The publication shown beside the form: the next issue lands on the stack of recent ones when someone subscribes. */
export interface NewsletterPublication {
  name: string
  /** The next issue. It is addressed to the new reader and joins the front of the stack on success. */
  upcoming: NewsletterIssue
  /** Recent issues, newest first. The first three make the stack. */
  recent: NewsletterIssue[]
}

const story = (title: string, minutes: number, image?: string): NewsletterStory => ({ title, image, minutes })

export const newsletterCopy = {
  inline: {
    title: "Five minutes on interface craft, every Friday",
    description: "Three links worth your time and one short essay on the details that make software feel right.",
  },
  card: {
    title: "Get the next issue on Friday",
    description: "Three links and one short essay on interface craft. Five minutes, once a week.",
  },
  privacy: "No tracking pixels. Unsubscribe with one click.",
  privacyLink: { label: "Privacy policy", href: "#privacy" },
}

/** Sample publication. Dates follow a Friday send. */
export const newsletterPublication: NewsletterPublication = {
  name: "Margins",
  upcoming: {
    number: 149,
    date: "Friday, October 2",
    subject: "Designing for the second visit, not the first",
    stories: [
      story("Empty states that invite a first step", 5),
      story("Texture without noise, from a ceramics studio", 4),
      story("How a concert hall seats two thousand people", 7),
    ],
  },
  recent: [
    {
      number: 148,
      date: "Friday, September 25",
      subject: "Why the best settings pages feel quiet",
      stories: [
        story("What a sunroom teaches about contrast", 4),
        story("The case for a single accent color", 3),
        story("Wayfinding at the scale of a city", 6),
      ],
    },
    {
      number: 147,
      date: "Friday, September 18",
      subject: "Springs that settle instead of bounce",
      stories: [
        story("Reading the ridge line of an animation curve", 5),
        story("A table lamp and the warmth of dark mode", 3),
        story("Curves in architecture and in corners", 4),
      ],
    },
    {
      number: 146,
      date: "Friday, September 11",
      subject: "Copy that sounds like a person",
      stories: [
        story("Error messages that take the blame", 4),
        story("Writing buttons as verbs", 3),
        story("Tone of voice at the dinner table", 5),
      ],
    },
  ],
}

/** Readers shown under the stack and in the card. */
export const newsletterReaders = {
  count: 12480,
  faces: ["Jasmine Brooks", "Daniel Kim", "Ava Mitchell"],
}
