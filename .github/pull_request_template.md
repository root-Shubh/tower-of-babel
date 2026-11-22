## What changed

<!-- One Jira ticket per PR. Title: SVTOB-<n>: <summary> -->

## How it was tested

## Jira

https://rootshubh.atlassian.net/browse/SVTOB-

## Checklist

- [ ] Branch is `feature-SVTOB-<n>` from `develop`
- [ ] Commits follow `SVTOB-<n> #comment <summary>`
- [ ] `npm run typecheck`, `npm test`, `npm run lint`, `npm run format:check`, `npm run check:changelog`, `npm run validate:content` pass
- [ ] New behaviour has tests; bug fixes have a regression test
- [ ] No network calls, remote assets, analytics or secrets
- [ ] User guide, CHANGELOG and DEVELOPMENT.md updated where needed
- [ ] CI green on ubuntu, windows and macos
