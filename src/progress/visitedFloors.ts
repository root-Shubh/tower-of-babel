/**
 * Which floors the explorer has entered.
 *
 * Interim store: the WebView's localStorage, which persists on Android and iOS. It moves to
 * the user database when local storage lands (SVTOB-15); the interface stays the same.
 * Storage can be unavailable (private mode, quota), so every access is guarded and the
 * app keeps working without it.
 */
const KEY = "tob.visitedFloors.v1";

export function loadVisitedFloors(storage: Storage | undefined = safeStorage()): Set<string> {
  try {
    const raw = storage?.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

export function saveVisitedFloors(
  visited: ReadonlySet<string>,
  storage: Storage | undefined = safeStorage(),
): void {
  try {
    storage?.setItem(KEY, JSON.stringify([...visited].sort()));
  } catch {
    // Not persisted this time; the in-memory set still drives the UI.
  }
}

function safeStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}
