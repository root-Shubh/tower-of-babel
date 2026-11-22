import corePack from "../../content/core/pack.json";
import coreFloors from "../../content/core/floors.json";
import { migrateContentPack } from "./migrate";
import type { ContentPack, Floor } from "./schema";

/**
 * The core library, bundled with the app so it works offline from first launch.
 * Optional packs are imported at runtime later (SVTOB-46, SVTOB-47).
 *
 * The pack's parts live in separate files under content/core/ so editors can work on
 * them independently; they are assembled and validated here.
 */
export function loadCorePack(): ContentPack {
  return migrateContentPack({ ...corePack, floors: coreFloors });
}

/** Floors in Tower order, lowest first. */
export function floorsInOrder(pack: ContentPack): Floor[] {
  return [...pack.floors].sort((a, b) => a.number - b.number);
}
