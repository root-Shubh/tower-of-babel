import { applyMigrations, ContentSchemaError, migrateContentPack } from "./migrate";
import { CONTENT_SCHEMA_VERSION, Id } from "./schema";

const license = { name: "CC-BY-4.0", attribution: "Tower of Babel editors" };

function validPack() {
  return {
    schemaVersion: 1,
    id: "core",
    version: "0.1.0",
    title: "Core library",
    floors: [
      {
        id: "floor_01",
        number: 1,
        title: "Primitive Survival",
        era: "Prehistory",
        context: "Before settlements.",
        description: "Water, fire, shelter and food.",
        architecture: "stone",
      },
    ],
    subjects: [
      { id: "fire", floorId: "floor_01", title: "Fire", description: "Making and keeping fire." },
    ],
    topics: [
      {
        id: "fire_basics",
        floorId: "floor_01",
        subjectId: "fire",
        title: "What fire is",
        summary: "Fuel, heat and oxygen.",
        difficulty: "beginner",
      },
      {
        id: "fire_combustion",
        floorId: "floor_01",
        subjectId: "fire",
        title: "Understanding Combustion",
        summary: "The chemistry of burning.",
        difficulty: "beginner",
        prerequisites: [{ topicId: "fire_basics", importance: "essential" }],
        references: [
          {
            destinationTopicId: "fire_basics",
            destinationFloorId: "floor_01",
            type: "prerequisite",
            explanation: "Combustion builds on the fire triangle.",
            importance: "essential",
          },
        ],
        bookIds: ["book_fire"],
      },
    ],
    books: [
      {
        id: "book_fire",
        floorId: "floor_01",
        subjectId: "fire",
        topicIds: ["fire_combustion"],
        title: "Fire and Combustion",
        description: "How fire works and how to make it safely.",
        editorial: { authors: ["Tower of Babel editors"] },
        difficulty: "beginner",
        readingMinutes: 40,
        license,
        chapters: [
          {
            id: "book_fire_ch01",
            title: "The fire triangle",
            pages: [
              {
                id: "book_fire_ch01_p01",
                type: "text",
                blocks: [
                  { kind: "heading", text: "Heat, fuel and oxygen" },
                  { kind: "paragraph", text: "Fire needs three things.", evidence: "established" },
                  { kind: "warning", level: "danger", text: "Never leave a fire unattended." },
                ],
              },
            ],
          },
        ],
      },
    ],
    media: [
      {
        id: "fig_fire_triangle",
        kind: "svg",
        file: "fire/triangle.svg",
        alt: "The fire triangle",
        license,
      },
    ],
  };
}

describe("Id", () => {
  it.each(["floor_01", "fire-combustion", "a", "book_fire_ch01_p01"])("accepts %s", (id) => {
    expect(Id.safeParse(id).success).toBe(true);
  });

  it.each(["", "Floor_01", "fire combustion", "fire__x", "_x", "x_", "fire/x", "fé"])(
    "rejects %j",
    (id) => {
      expect(Id.safeParse(id).success).toBe(false);
    },
  );
});

describe("migrateContentPack", () => {
  it("accepts a valid pack and fills defaults", () => {
    const pack = migrateContentPack(validPack());
    expect(pack.topics[0]?.prerequisites).toEqual([]);
    expect(pack.subjects[0]?.domain).toBe("core");
    expect(pack.books[0]?.license.publicDomain).toBe(false);
  });

  it("rejects non-objects", () => {
    for (const raw of [null, 3, "pack", []]) {
      expect(() => migrateContentPack(raw)).toThrow(ContentSchemaError);
    }
  });

  it("rejects a missing or invalid schemaVersion", () => {
    const rest: Record<string, unknown> = validPack();
    delete rest.schemaVersion;
    expect(() => migrateContentPack(rest)).toThrow(/schemaVersion/);
    expect(() => migrateContentPack({ ...validPack(), schemaVersion: 0 })).toThrow(/schemaVersion/);
  });

  it("rejects packs from a newer schema with a clear message", () => {
    const raw = { ...validPack(), schemaVersion: CONTENT_SCHEMA_VERSION + 1 };
    expect(() => migrateContentPack(raw)).toThrow(/Update the app/);
  });

  it("rejects an unknown page type", () => {
    const raw = validPack();
    (raw.books[0]!.chapters[0]!.pages[0] as { type: string }).type = "hologram";
    expect(() => migrateContentPack(raw)).toThrow(/books\.0\.chapters\.0\.pages\.0\.type/);
  });

  it("requires a licence on every book", () => {
    const raw = validPack();
    delete (raw.books[0] as { license?: unknown }).license;
    expect(() => migrateContentPack(raw)).toThrow(/books\.0\.license/);
  });

  it("rejects remote media", () => {
    for (const file of ["https://example.org/a.svg", "//cdn.example.org/a.svg", "data:image/png"]) {
      const raw = validPack();
      raw.media[0]!.file = file;
      expect(() => migrateContentPack(raw)).toThrow(/local path/);
    }
  });

  it("rejects an empty chapter", () => {
    const raw = validPack();
    raw.books[0]!.chapters[0]!.pages = [];
    expect(() => migrateContentPack(raw)).toThrow(ContentSchemaError);
  });

  it("accepts Unicode text", () => {
    const raw = validPack();
    raw.topics[0]!.title = "火 — Feuer — النار";
    expect(migrateContentPack(raw).topics[0]?.title).toBe("火 — Feuer — النار");
  });
});

describe("applyMigrations", () => {
  const registry = {
    1: (p: Record<string, unknown>) => ({ ...p, title: `${String(p.title)} v2` }),
    2: (p: Record<string, unknown>) => ({ ...p, title: `${String(p.title)} v3` }),
  };

  it("runs each step in order and stamps the version", () => {
    const out = applyMigrations({ schemaVersion: 1, title: "Pack" }, 1, 3, registry);
    expect(out).toEqual({ schemaVersion: 3, title: "Pack v2 v3" });
  });

  it("does nothing when already current", () => {
    expect(applyMigrations({ schemaVersion: 3, title: "x" }, 3, 3, registry).title).toBe("x");
  });

  it("fails when a step is missing", () => {
    expect(() => applyMigrations({ schemaVersion: 1 }, 1, 4, registry)).toThrow(/3 to 4/);
  });
});
