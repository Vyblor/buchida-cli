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
