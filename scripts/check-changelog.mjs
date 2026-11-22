// Fails when CHANGELOG.md has neither an Unreleased section nor a heading for the
// version in package.json. Run with: npm run check:changelog
import { readFileSync } from "node:fs";

const root = new URL("..", import.meta.url);
const pkg = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
const changelog = readFileSync(new URL("CHANGELOG.md", root), "utf8");

const heading = `## [${pkg.version}]`;
if (!changelog.includes(heading) && !changelog.includes("## [Unreleased]")) {
  console.error(`CHANGELOG.md has no "## [Unreleased]" or "${heading}" section.`);
  process.exit(1);
}
console.error(`CHANGELOG.md OK for ${pkg.version}.`);
