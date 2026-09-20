# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-09-20

**Breaking: this release targets the OpenCode V2 plugin API and does not run on OpenCode V1.**
If you are staying on OpenCode V1, pin the last V1-compatible release, [`v0.1.0`](https://github.com/LaynePeng/opencode-commandcode-plan-auth/tree/v0.1.0).

### Changed

- **Plugin API migrated from V1 to V2.** The entrypoint is now a default-exported `Plugin.define({ id, setup })` definition instead of a function returning `config` / `auth` hooks.
  - Provider registration moved from the V1 `config` hook to the V2 `ctx.provider.transform`.
  - Authentication moved from the V1 `auth` hook to `ctx.integration.transform` (integration with `key` and `env` methods).
- **Configuration key changed.** V1 used the `plugin` array; V2 uses `plugins` with explicit package entries:

  ```jsonc
  // before (V1)
  "plugin": [["opencode-commandcode-plan-auth", { "zdr": false }]]
  // after (V2)
  "plugins": [{ "package": "opencode-commandcode-plan-auth", "options": { "zdr": false } }]
  ```

- **Credentials moved.** V1 stored the `/connect` key in `~/.local/share/opencode/auth.json`; V2 moves credentials into `~/.local/share/opencode/account.json`, bound to an integration. Because the Command Code integration did not exist in V1, its credential does not migrate automatically — run `/connect` again or set `CMD_API_KEY`.

### Removed

- Dependency on `@opencode-ai/plugin` (V1 plugin API). Added `@opencode/plugin@^2` as the runtime plugin contract.

### Migration

See the [Upgrading from OpenCode V1](README.md#upgrading-from-opencode-v1) section of the README for the full upgrade steps, config before/after, and a troubleshooting table of upgrade symptoms.

## [0.1.0] - 2026-09-15

Last release targeting the OpenCode **V1** plugin API (`@opencode-ai/plugin`).

### Added

- Initial release of the Command Code (CommandCode) provider plugin.
- Native `/connect` flow for API key entry.
- Live model catalog discovery from `GET /provider/v1/models`, with disk cache and bundled offline snapshot.
- Dual-endpoint routing: Anthropic `/v1/messages` for `claude*` models, OpenAI-compatible `/v1/chat/completions` for everything else.
- Zero-data-retention routing via the `x-cmd-zdr: 1` header (opt out with `{"zdr": false}`).
- Environment variable auth via `CMD_API_KEY` / `COMMANDCODE_API_KEY`.

### Changed

- Renamed the package to `opencode-commandcode-plan-auth`.
- Model costs updated to official Command Code rates; fixed the environment key on the Anthropic route.

[Unreleased]: https://github.com/LaynePeng/opencode-commandcode-plan-auth/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/LaynePeng/opencode-commandcode-plan-auth/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/LaynePeng/opencode-commandcode-plan-auth/releases/tag/v0.1.0
