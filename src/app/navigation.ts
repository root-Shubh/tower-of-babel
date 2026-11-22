/**
 * Navigation history (spec sections 4 and 11).
 *
 * The Tower and the Home Base each keep their own stack, so switching environments and
 * coming back returns the user to exactly where they were. Every entry remembers its scroll
 * position. Back pops the active stack; at the Tower's root it returns to the Home Base; at
 * the Home Base's root it asks the platform to exit.
 *
 * Kept as a pure reducer so every rule is unit-tested without a UI.
 */

export type Environment = "home" | "tower";

export type Location =
  { screen: "home" } | { screen: "tower" } | { screen: "floor"; floorId: string };

export interface Entry {
  location: Location;
  /** Vertical scroll offset in pixels, restored when the entry becomes visible again. */
  scrollTop: number;
}

export interface NavigationState {
  active: Environment;
  stacks: Record<Environment, Entry[]>;
  /** Set when back is pressed at the very root: the shell should close the app. */
  exitRequested: boolean;
}

export type NavigationAction =
  | { type: "push"; location: Location }
  | { type: "back" }
  | { type: "switch"; environment: Environment }
  | { type: "saveScroll"; scrollTop: number }
  | { type: "exitHandled" };

/**
 * Scroll offset meaning "the end of the page". The browser clamps it to the real maximum,
 * so the Tower opens at its ground floor and the explorer climbs upward.
 */
export const SCROLL_TO_END = 1_000_000_000;

const roots: Record<Environment, Location> = {
  home: { screen: "home" },
  tower: { screen: "tower" },
};

export function initialNavigation(): NavigationState {
  return {
    active: "home",
    stacks: {
      home: [{ location: roots.home, scrollTop: 0 }],
      tower: [{ location: roots.tower, scrollTop: SCROLL_TO_END }],
    },
    exitRequested: false,
  };
}

export function currentEntry(state: NavigationState): Entry {
  const stack = state.stacks[state.active];
  const top = stack[stack.length - 1];
  if (!top) throw new Error("Navigation stack is empty");
  return top;
}

function environmentOf(location: Location): Environment {
  return location.screen === "home" ? "home" : "tower";
}

function sameLocation(a: Location, b: Location): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function navigationReducer(
  state: NavigationState,
  action: NavigationAction,
): NavigationState {
  switch (action.type) {
    case "push": {
      const environment = environmentOf(action.location);
      const stack = state.stacks[environment];
      const top = stack[stack.length - 1];
      // Re-opening the current location does not grow the history.
      if (environment === state.active && top && sameLocation(top.location, action.location)) {
        return state;
      }
      return {
        ...state,
        active: environment,
        stacks: {
          ...state.stacks,
          [environment]: [...stack, { location: action.location, scrollTop: 0 }],
        },
      };
    }
    case "back": {
      const stack = state.stacks[state.active];
      if (stack.length > 1) {
        return { ...state, stacks: { ...state.stacks, [state.active]: stack.slice(0, -1) } };
      }
      if (state.active === "tower") return { ...state, active: "home" };
      return { ...state, exitRequested: true };
    }
    case "switch":
      if (action.environment === state.active) return state;
      return { ...state, active: action.environment };
    case "saveScroll": {
      const stack = state.stacks[state.active];
      const top = stack[stack.length - 1];
      if (!top || top.scrollTop === action.scrollTop) return state;
      return {
        ...state,
        stacks: {
          ...state.stacks,
          [state.active]: [...stack.slice(0, -1), { ...top, scrollTop: action.scrollTop }],
        },
      };
    }
    case "exitHandled":
      return state.exitRequested ? { ...state, exitRequested: false } : state;
  }
}
