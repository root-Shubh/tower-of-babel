// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Offline is non-negotiable (spec section 13): app source and the page shell must not
// reference remote resources or call network APIs. Licence and attribution URLs belong in
// content metadata, which is shown as text and never loaded as a resource.
const root = fileURLToPath(new URL("..", import.meta.url));
const scanned = ["src", "index.html"];
const remote = /\b(?:https?:)?\/\/(?!localhost\b)[a-z0-9-]+(?:\.[a-z0-9-]+)+/i;
const networkApis = /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/;

function listFiles(path: string): string[] {
  const full = join(root, path);
  if (statSync(full).isFile()) return [path];
  return readdirSync(full).flatMap((name: string) => listFiles(join(path, name)));
}

const sources = scanned.flatMap(listFiles).filter((file) => !/\.test\.tsx?$/.test(file));

describe("offline guarantee", () => {
  it("finds source files to scan", () => {
    expect(sources.length).toBeGreaterThan(0);
  });

  it.each(sources)("%s has no remote URLs or network APIs", (file) => {
    const text = readFileSync(join(root, file), "utf8");
    expect(text).not.toMatch(remote);
    expect(text).not.toMatch(networkApis);
  });

  it("detects a remote URL (self-check)", () => {
    expect("load https://cdn.example.com/x.js").toMatch(remote);
    expect("const x = fetch(url)").toMatch(networkApis);
  });
});

describe("Android manifest", () => {
  it("does not request network permissions", () => {
    const manifest = readFileSync(join(root, "android/app/src/main/AndroidManifest.xml"), "utf8");
    expect(manifest).not.toMatch(
      /uses-permission[^>]+android\.permission\.(INTERNET|ACCESS_NETWORK_STATE)/,
    );
  });
});
