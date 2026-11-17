# make.fun — a fast, light frontend

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/Jesyyhezii/makefun-frontend-entry/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/Jesyyhezii/makefun-frontend-entry/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

Competition entry for the [make.fun](https://make.fun/bounty/makefun-frontend-01)
`makefun-frontend-01` bounty: a fully working web client for make.fun, made of
plain static files with no build step, no framework and no external code.

## Run it

`node serve.ts` serves `app/` on http://localhost:8080 — open it in any browser.

## Surfaces (hash routes, each with its own URL)

- `#/` — the live bounty board: every open bounty with its live pot, entry fee,
  time left (by deadline, not status alone) and entry count, plus a text filter.
- `#/bounty/<slug>` — a bounty's page: summary, description and rules rendered
  from a safe markdown subset, dates, status, skills and the rewards table
  split from the live pot.
- `#/bounty/<slug>/leaderboard` — that bounty's live leaderboard; account names
  link through to profiles.
- `#/u/<handle>` — an account's public profile: record, prizes and entries.

## Performance and accessibility

- Vanilla ES modules and one stylesheet; the router loads the API/view modules
  lazily with `import()`, so the first load is just the shell, one CSS file and
  one small module.
- API answers are cached in memory and revalidated with ETag / `If-None-Match`.
- Semantic landmarks, skip link, visible focus, labelled tables, keyboard and
  screen-reader friendly, responsive down to phone widths, reduced-motion aware.

## Hand-in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to
`/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `dossier.json` with the vendored
`buildDossier` from `vendor/makefun-frontend.ts`, copied from the kit unchanged.
