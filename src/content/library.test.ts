import { floorsInOrder, loadCorePack } from "./library";
import { KnowledgeDomain } from "./schema";

const SPEC_FLOORS = [
  "Primitive Survival",
  "Fire, Tools and Early Materials",
  "Agriculture and Domestication",
  "Settlements and Early Communities",
  "Metallurgy and Craftsmanship",
  "Mathematics, Writing and Record Keeping",
  "Architecture and Civil Engineering",
  "Medicine and Human Biology",
  "Trade, Economics and Governance",
  "Classical Science and Philosophy",
  "Advanced Agriculture and Manufacturing",
  "Mechanical Engineering and Industrialization",
  "Chemistry, Physics and Modern Medicine",
  "Electricity and Telecommunications",
  "Modern Engineering and Transportation",
  "Computing and Information Technology",
  "Advanced Biology and Biotechnology",
  "Modern Science and Space Exploration",
];

describe("core floor taxonomy", () => {
  const pack = loadCorePack();
  const floors = floorsInOrder(pack);

  it("validates against the content schema", () => {
    expect(pack.id).toBe("core");
  });

  it("has the 18 floors from the specification, in order", () => {
    expect(floors.map((f) => f.title)).toEqual(SPEC_FLOORS);
  });

  it("numbers floors 1..n without gaps or duplicates", () => {
    expect(floors.map((f) => f.number)).toEqual(SPEC_FLOORS.map((_, i) => i + 1));
  });

  it("gives every floor a unique stable id", () => {
    const ids = floors.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    floors.forEach((f) => expect(f.id).toBe(`floor_${String(f.number).padStart(2, "0")}`));
  });

  it("never moves to a simpler architecture as floors rise", () => {
    const order = [
      "stone",
      "wood-and-clay",
      "brick-and-bronze",
      "classical",
      "medieval",
      "industrial",
      "modern",
      "advanced",
    ];
    const ranks = floors.map((f) => order.indexOf(f.architecture));
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("supports the cross-cutting history, culture and geography domains", () => {
    expect(KnowledgeDomain.options).toEqual(
      expect.arrayContaining(["history", "culture", "geography"]),
    );
  });
});
