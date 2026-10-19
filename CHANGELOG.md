## 0.1.8 — 2026-10-19

### Added
- `buchida emails list` options `--cursor`, `--status`, `--from` (sender), `--to` (recipient). A hint with the next `--cursor` is printed to stderr when more results exist.

### Fixed
- `--json` (and `--api-key`) placed after a subcommand were swallowed by the root program, so `buchida emails list --json` printed a table. Both `buchida emails list --json` and `buchida --json emails list` now print JSON.
- `emails list` read `has_more`; the API sends `hasMore`. Both are now read.
- `buchida metrics` sent an unsupported `period` param. `--period` (24h/7d/30d) is now mapped to `from_date`/`to_date`; table output no longer breaks on the API's `{data: {...}}` shape.

## 0.1.7 — 2026-10-13

### Added
- `buchida send --from-name <name>` sets the sender display name (API field `from_name`). `--from` also accepts `"Name <addr>"`.
- `buchida emails get` shows the sender as `Name <addr>` when the email has a `from_name`.

## 0.1.6 — 2026-04-17

### Added
- `buchida domains list` subcommand — list your registered domains with verification status.
- Friendly error rendering for `domain_not_registered` and `domain_not_verified` with actionable hints.

### Changed
- Error output now includes a `Hint:` line when the buchida API returns `domain_not_*` codes.

## 0.1.5 — 2026-04-17

### Fixed
- `User-Agent` header now reflects package.json version (was hardcoded at `buchida-cli/0.1.0`, which caused the buchida API logs to show the wrong version for every CLI request).

## 0.1.4 — 2026-04-17

### Fixed
- `--version` now reflects package.json (was hardcoded at 0.1.0 since the initial release).
