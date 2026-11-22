import { loadVisitedFloors, saveVisitedFloors } from "./visitedFloors";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

const broken = {
  getItem() {
    throw new Error("denied");
  },
  setItem() {
    throw new Error("quota");
  },
} as unknown as Storage;

describe("visited floors", () => {
  it("round-trips through storage", () => {
    const storage = new MemoryStorage();
    saveVisitedFloors(new Set(["floor_02", "floor_01"]), storage);
    expect(loadVisitedFloors(storage)).toEqual(new Set(["floor_01", "floor_02"]));
  });

  it("starts empty", () => {
    expect(loadVisitedFloors(new MemoryStorage()).size).toBe(0);
  });

  it("ignores corrupt or unexpected data", () => {
    const storage = new MemoryStorage();
    storage.setItem("tob.visitedFloors.v1", "{not json");
    expect(loadVisitedFloors(storage).size).toBe(0);
    storage.setItem("tob.visitedFloors.v1", JSON.stringify({ a: 1 }));
    expect(loadVisitedFloors(storage).size).toBe(0);
    storage.setItem("tob.visitedFloors.v1", JSON.stringify(["floor_01", 7, null]));
    expect(loadVisitedFloors(storage)).toEqual(new Set(["floor_01"]));
  });

  it("keeps working when storage throws", () => {
    expect(loadVisitedFloors(broken).size).toBe(0);
    expect(() => saveVisitedFloors(new Set(["floor_01"]), broken)).not.toThrow();
  });
});
