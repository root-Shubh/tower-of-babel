import { CONTENT_SCHEMA_VERSION, ContentPack } from "./schema";

/**
 * Upgrades a raw content pack to the current schema version, then validates it.
 *
 * Each entry in `migrations` turns version N into N+1. When the schema changes, bump
 * CONTENT_SCHEMA_VERSION and add a migration with a test; never edit an old migration.
 */
export type RawPack = Record<string, unknown> & { schemaVersion?: unknown };

export const migrations: Record<number, (pack: RawPack) => RawPack> = {
  // 1 -> 2 goes here when version 2 exists.
};

export class ContentSchemaError extends Error {}

export function migrateContentPack(raw: unknown): ContentPack {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new ContentSchemaError("A content pack must be a JSON object.");
  }
  let pack = { ...(raw as RawPack) };
  const version = pack.schemaVersion;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    throw new ContentSchemaError("Content pack has no valid schemaVersion.");
  }
  if (version > CONTENT_SCHEMA_VERSION) {
    throw new ContentSchemaError(
      `Content pack uses schema ${version}, but this app reads up to ${CONTENT_SCHEMA_VERSION}. Update the app.`,
    );
  }
  pack = applyMigrations(pack, version, CONTENT_SCHEMA_VERSION);
  const result = ContentPack.safeParse(pack);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 10)
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new ContentSchemaError(`Content pack failed validation:\n${issues}`);
  }
  return result.data;
}

/** Runs migrations from version `from` up to `to`, one step at a time. */
export function applyMigrations(
  pack: RawPack,
  from: number,
  to: number,
  registry: Record<number, (pack: RawPack) => RawPack> = migrations,
): RawPack {
  let current = pack;
  for (let v = from; v < to; v++) {
    const step = registry[v];
    if (!step) throw new ContentSchemaError(`No migration from schema ${v} to ${v + 1}.`);
    current = { ...step(current), schemaVersion: v + 1 };
  }
  return current;
}
