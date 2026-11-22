import { z } from "zod";

/**
 * Content schemas for the Tower's knowledge hierarchy (spec sections 5, 6, 7 and 17):
 *
 *   TOWER > FLOOR > SUBJECT > TOPIC > BOOK > CHAPTER > PAGE
 *
 * Content is data. It lives in content packs, never in application code. Every object
 * carries a stable id that is never reused. A pack declares the schema version it was
 * written for; `migrateContentPack` upgrades older packs before validation.
 */

export const CONTENT_SCHEMA_VERSION = 1;

/** Stable identifier: lowercase letters and digits, separated by single `_` or `-`. */
export const Id = z
  .string()
  .regex(/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/, "ids use lowercase letters, digits, _ and -")
  .max(80);
export type Id = z.infer<typeof Id>;

const Text = z.string().trim().min(1);

export const Difficulty = z.enum(["beginner", "intermediate", "advanced", "expert"]);
export type Difficulty = z.infer<typeof Difficulty>;

/** How certain a statement is (spec section 14). */
export const EvidenceLevel = z.enum([
  "established", // established scientific fact
  "historical-evidence",
  "scholarly-interpretation",
  "disputed",
  "uncertain",
  "belief-or-mythology",
]);
export type EvidenceLevel = z.infer<typeof EvidenceLevel>;

export const License = z.object({
  /** SPDX id where one exists (e.g. CC-BY-4.0, CC0-1.0), otherwise a short name. */
  name: Text,
  /** Who made it, as the licence requires it to be credited. */
  attribution: Text,
  /** Where it came from. Shown as text only; never loaded. */
  source: z.string().optional(),
  url: z.string().optional(),
  publicDomain: z.boolean().default(false),
});
export type License = z.infer<typeof License>;

export const KnowledgeDomain = z.enum(["core", "history", "culture", "geography"]);
export type KnowledgeDomain = z.infer<typeof KnowledgeDomain>;

export const Floor = z.object({
  id: Id,
  /** 1-based position in the Tower. Higher floors hold more advanced knowledge. */
  number: z.number().int().positive(),
  title: Text,
  /** Short label for the era or conceptual level, e.g. "Prehistory". */
  era: Text,
  /** Historical or conceptual context shown on entering the floor. */
  context: Text,
  description: Text,
  /** Architectural theme used by the Tower renderer. */
  architecture: z.enum([
    "stone",
    "wood-and-clay",
    "brick-and-bronze",
    "classical",
    "medieval",
    "industrial",
    "modern",
    "advanced",
  ]),
});
export type Floor = z.infer<typeof Floor>;

export const Subject = z.object({
  id: Id,
  floorId: Id,
  title: Text,
  description: Text,
  domain: KnowledgeDomain.default("core"),
});
export type Subject = z.infer<typeof Subject>;

export const ReferenceType = z.enum([
  "prerequisite",
  "explains",
  "historical-context",
  "related",
  "further-reading",
]);
export type ReferenceType = z.infer<typeof ReferenceType>;

export const Importance = z.enum(["essential", "supplementary"]);
export type Importance = z.infer<typeof Importance>;

/**
 * A reference from the owning topic (the source) to another topic. The destination floor
 * is stored explicitly so the dependency rule can be checked without loading the target.
 */
export const Reference = z.object({
  destinationTopicId: Id,
  destinationFloorId: Id,
  type: ReferenceType,
  explanation: Text,
  importance: Importance,
  /** Optional deep link into a book that documents the destination. */
  destinationBookId: Id.optional(),
  destinationPageId: Id.optional(),
});
export type Reference = z.infer<typeof Reference>;

export const Prerequisite = z.object({
  topicId: Id,
  importance: Importance,
  explanation: z.string().optional(),
});
export type Prerequisite = z.infer<typeof Prerequisite>;

export const Topic = z.object({
  id: Id,
  floorId: Id,
  subjectId: Id,
  title: Text,
  summary: Text,
  difficulty: Difficulty,
  prerequisites: z.array(Prerequisite).default([]),
  references: z.array(Reference).default([]),
  bookIds: z.array(Id).default([]),
  mediaIds: z.array(Id).default([]),
  /** Named entities (people, civilizations, places, materials...) for the entity index. */
  entities: z.array(z.object({ kind: Text, name: Text })).default([]),
});
export type Topic = z.infer<typeof Topic>;

export const PageType = z.enum([
  "text",
  "illustrated",
  "technical-diagram",
  "scientific-diagram",
  "historical-map",
  "timeline",
  "table",
  "step-by-step",
  "annotated-graphic",
  "interactive",
  "video",
]);
export type PageType = z.infer<typeof PageType>;

/** Building blocks of a page. Rendering per block type is done by the reader (SVTOB-25). */
export const Block = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("heading"), text: Text }),
  z.object({
    kind: z.literal("paragraph"),
    text: Text,
    evidence: EvidenceLevel.optional(),
  }),
  z.object({ kind: z.literal("list"), ordered: z.boolean().default(false), items: z.array(Text) }),
  z.object({
    kind: z.literal("media"),
    mediaId: Id,
    caption: z.string().optional(),
  }),
  z.object({
    kind: z.literal("table"),
    caption: z.string().optional(),
    columns: z.array(Text).min(1),
    rows: z.array(z.array(z.string())),
  }),
  z.object({
    kind: z.literal("steps"),
    steps: z.array(z.object({ title: Text, detail: z.string().optional() })).min(1),
  }),
  z.object({
    kind: z.literal("warning"),
    level: z.enum(["caution", "danger"]),
    text: Text,
  }),
  z.object({
    kind: z.literal("historical-note"),
    /** Marks a historical technique that is not modern safe practice. */
    text: Text,
  }),
  z.object({
    kind: z.literal("timeline"),
    events: z.array(z.object({ date: Text, label: Text })).min(1),
  }),
  z.object({ kind: z.literal("reference"), topicId: Id, text: z.string().optional() }),
]);
export type Block = z.infer<typeof Block>;

export const Page = z.object({
  id: Id,
  type: PageType,
  title: z.string().optional(),
  blocks: z.array(Block).min(1),
});
export type Page = z.infer<typeof Page>;

export const Chapter = z.object({
  id: Id,
  title: Text,
  pages: z.array(Page).min(1),
});
export type Chapter = z.infer<typeof Chapter>;

export const BibliographyEntry = z.object({
  title: Text,
  author: z.string().optional(),
  year: z.string().optional(),
  publisher: z.string().optional(),
  note: z.string().optional(),
});
export type BibliographyEntry = z.infer<typeof BibliographyEntry>;

export const Book = z.object({
  id: Id,
  floorId: Id,
  subjectId: Id,
  topicIds: z.array(Id).min(1),
  title: Text,
  description: Text,
  /** Media id of the cover illustration. */
  coverMediaId: Id.optional(),
  editorial: z.object({
    authors: z.array(Text).min(1),
    editors: z.array(Text).default([]),
    revised: z.string().optional(),
  }),
  difficulty: Difficulty,
  readingMinutes: z.number().int().positive(),
  prerequisiteTopicIds: z.array(Id).default([]),
  chapters: z.array(Chapter).min(1),
  bibliography: z.array(BibliographyEntry).default([]),
  license: License,
});
export type Book = z.infer<typeof Book>;

export const Media = z.object({
  id: Id,
  kind: z.enum(["svg", "webp", "png", "video", "map"]),
  /** Path inside the pack's media folder. Never a URL. */
  file: z
    .string()
    .min(1)
    .refine((f) => !/^[a-z]+:/i.test(f) && !f.startsWith("//"), "media must be a local path"),
  alt: Text,
  caption: z.string().optional(),
  license: License,
});
export type Media = z.infer<typeof Media>;

export const ContentPack = z.object({
  schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
  id: Id,
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "semantic version, e.g. 1.0.0"),
  title: Text,
  description: z.string().default(""),
  /** Other packs this one needs, by id and minimum version. */
  dependencies: z.array(z.object({ packId: Id, minVersion: z.string() })).default([]),
  floors: z.array(Floor).default([]),
  subjects: z.array(Subject).default([]),
  topics: z.array(Topic).default([]),
  books: z.array(Book).default([]),
  media: z.array(Media).default([]),
});
export type ContentPack = z.infer<typeof ContentPack>;
export type ContentPackInput = z.input<typeof ContentPack>;
