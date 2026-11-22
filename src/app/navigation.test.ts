import {
  currentEntry,
  initialNavigation,
  navigationReducer,
  type NavigationAction,
  type NavigationState,
} from "./navigation";

function run(...actions: NavigationAction[]): NavigationState {
  return actions.reduce(navigationReducer, initialNavigation());
}

const floor1 = { screen: "floor", floorId: "floor_01" } as const;
const floor5 = { screen: "floor", floorId: "floor_05" } as const;

describe("navigation", () => {
  it("starts at the Home Base", () => {
    const state = initialNavigation();
    expect(state.active).toBe("home");
    expect(currentEntry(state).location).toEqual({ screen: "home" });
  });

  it("pushing a Tower location switches to the Tower", () => {
    const state = run({ type: "push", location: floor1 });
    expect(state.active).toBe("tower");
    expect(currentEntry(state).location).toEqual(floor1);
  });

  it("back returns to the previous location", () => {
    const state = run(
      { type: "push", location: floor1 },
      { type: "push", location: floor5 },
      { type: "back" },
    );
    expect(currentEntry(state).location).toEqual(floor1);
  });

  it("restores the exact scroll position after back", () => {
    const state = run(
      { type: "push", location: floor1 },
      { type: "saveScroll", scrollTop: 640 },
      { type: "push", location: floor5 },
      { type: "saveScroll", scrollTop: 90 },
      { type: "back" },
    );
    expect(currentEntry(state)).toEqual({ location: floor1, scrollTop: 640 });
  });

  it("new entries start at the top", () => {
    const state = run(
      { type: "push", location: floor1 },
      { type: "saveScroll", scrollTop: 300 },
      { type: "push", location: floor5 },
    );
    expect(currentEntry(state).scrollTop).toBe(0);
  });

  it("does not stack the same location twice", () => {
    const state = run({ type: "push", location: floor1 }, { type: "push", location: floor1 });
    expect(state.stacks.tower).toHaveLength(2);
  });

  it("keeps each environment's place when switching", () => {
    const state = run(
      { type: "push", location: floor5 },
      { type: "switch", environment: "home" },
      { type: "switch", environment: "tower" },
    );
    expect(currentEntry(state).location).toEqual(floor5);
  });

  it("back at the Tower root goes to the Home Base", () => {
    const state = run({ type: "switch", environment: "tower" }, { type: "back" });
    expect(state.active).toBe("home");
    expect(state.exitRequested).toBe(false);
  });

  it("back at the Home Base root requests exit, once", () => {
    const state = run({ type: "back" });
    expect(state.exitRequested).toBe(true);
    expect(navigationReducer(state, { type: "exitHandled" }).exitRequested).toBe(false);
  });

  it("unwinds a long chain step by step", () => {
    const floors = Array.from({ length: 6 }, (_, i) => ({
      screen: "floor" as const,
      floorId: `floor_0${i + 1}`,
    }));
    let state = run(...floors.map((location) => ({ type: "push" as const, location })));
    for (let i = floors.length - 2; i >= 0; i--) {
      state = navigationReducer(state, { type: "back" });
      expect(currentEntry(state).location).toEqual(floors[i]);
    }
    state = navigationReducer(state, { type: "back" });
    expect(currentEntry(state).location).toEqual({ screen: "tower" });
  });
});
