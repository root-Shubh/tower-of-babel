# Contributing

The Tower of Babel uses a fixed branch flow, one Jira ticket per unit of work, and
pull requests into `develop`. Follow these steps for every change.

## Branches

| Branch | Purpose | Rules |
|---|---|---|
| `master` | Golden source. Released code only. | Protected |
| `release` | Release candidate | Protected |
| `staging` | User acceptance testing | Protected |
| `qa` | QA | Protected |
| `develop` | Integration. Features are merged here first. | Protected |
| `feature-SVTOB-<n>` | One branch per Jira ticket, created from `develop` | Deleted after merge |

Protected means: changes arrive only through a pull request, CI must pass on
`ci (ubuntu-latest)`, `ci (windows-latest)` and `ci (macos-latest)`, no
force-push and no deletion. The repository admin can merge their own pull
requests through the ruleset bypass, because GitHub does not let an author
approve their own pull request.

Promotion order: `feature → develop → qa → staging → release → master`, one pull
request per step, each merged with a merge commit after CI passes on the source
branch.

## Step by step

1. **Pick or create a Jira ticket** in project `SVTOB`, under the right phase
   epic (SVTOB-1 to SVTOB-8). Story for features, Bug for defects, Task for other
   work.
2. **Branch from `develop`:**
   ```bash
   git checkout develop
   git pull
   git checkout -b feature-SVTOB-<n>
   ```
3. **Make the change.** Keep it to one ticket. Tests and docs go in the same
   branch.
4. **Check it locally:**
   ```bash
   npm run typecheck
   npm test
   npm run lint
   npm run format:check      # fix with: npm run format
   npm run check:changelog
   npm run validate:content
   npm run build
   ```
   For Android changes also run `npx cap sync android` and
   `cd android && ./gradlew assembleDebug`.
5. **Commit** with the Jira key, `#comment` and a short summary:
   ```
   SVTOB-<n> #comment <short change summary>
   ```
6. **Push and open a pull request into `develop`.** Title:
   `SVTOB-<n>: <summary>`. Fill in the template: what changed, how it was tested,
   the Jira link.
7. **Wait for CI** on all three operating systems.
8. **Merge with a merge commit** (not squash), then delete the feature branch.
9. **Update Jira:** comment with the summary and the PR link, then move the
   ticket to Done.

## Rules that never bend

- **Offline only.** No network calls at runtime, no remote fonts, images, map
  tiles, analytics or APIs. A unit test fails the build if the app source
  references a remote URL.
- **Floor dependencies.** A topic may only depend on topics on its own floor or
  lower floors. `npm run validate:content` enforces this and runs in CI.
- **Content is data.** Knowledge content lives in `content/`, never in
  application code. Every object has a stable id that is never reused.
- **User data is separate.** Notes, bookmarks and other personal data never
  change library content, and an update never silently deletes them.
- **Licensing.** Every book, illustration and map records its source and licence.
  Use original, public-domain or openly licensed material only.

## Documentation

- A user-visible change updates `docs/user-guide.md` and adds an entry under
  *Unreleased* in `CHANGELOG.md`.
- An architecture change updates `ARCHITECTURE.md`.
- Every milestone updates `DEVELOPMENT.md` (decisions, features, known issues,
  coverage, test results, next milestone).
- A process change updates this file.

## Security

Do not commit tokens, passwords, keystores or personal data. If one is committed
by mistake, revoke it first, then remove it from the history.
