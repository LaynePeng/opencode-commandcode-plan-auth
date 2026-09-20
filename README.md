# opencode-commandcode-plan-auth

[Command Code](https://commandcode.ai) (CommandCode) Provider API as a first-class [opencode](https://opencode.ai) provider.

> Requires **opencode V2** (`@opencode/plugin` v2). V1 plugin implementations do not run in V2 — this package targets the V2 plugin API.
>
> **Still on opencode V1?** v0.2.0+ is V2-only and will not load on V1. Use the last V1-compatible release instead: [`v0.1.0`](https://github.com/LaynePeng/opencode-commandcode-plan-auth/tree/v0.1.0).
>
> ```bash
> git clone --branch v0.1.0 https://github.com/LaynePeng/opencode-commandcode-plan-auth.git
> ```

Every top model — Claude, GPT, Gemini, DeepSeek, Kimi, GLM, MiniMax, Qwen and more — through one subscription, with the same `/connect` experience as any built-in provider.

## Features

- **Native `/connect` flow** — run `/connect`, pick *Command Code Go*, paste your API key. Done.
- **Live model discovery** — the full catalog is fetched from `GET /provider/v1/models` at startup, cached on disk (24h TTL), with a bundled snapshot as offline fallback.
- **Dual-endpoint routing** — Command Code serves Claude models over the Anthropic `/v1/messages` endpoint and everything else over the OpenAI-compatible `/v1/chat/completions` endpoint. The provider default uses `@opencode/ai/providers/openai-compatible`, and every `claude*` model overrides it with `@opencode/ai/providers/anthropic`, so Claude and open models both just work from one provider.
- **Rich model metadata** — context/output limits, tool and vision capabilities, reasoning field and per-model costs (official Command Code rates where published, models.dev upstream rates otherwise).
- **Zero data retention by default** — sends `x-cmd-zdr: 1` on every request so traffic only routes through ZDR-capable upstreams. Opt out with `{"zdr": false}`.
- **Environment variable auth** — `CMD_API_KEY` or `COMMANDCODE_API_KEY` work without `/connect`.
- **User config always wins** — anything you define yourself under `providers["commandcode-go"]` in `opencode.json` overrides what the plugin registers.

## Install

### From npm

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["opencode-commandcode-plan-auth"]
}
```

Or with options:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": [
    {
      "package": "opencode-commandcode-plan-auth",
      "options": { "zdr": false }
    }
  ]
}
```

### From source

```bash
git clone https://github.com/LaynePeng/opencode-commandcode-plan-auth.git
cd opencode-commandcode-plan-auth
npm install && npm run build
mkdir -p ~/.config/opencode/plugins
ln -s "$PWD/dist/index.js" ~/.config/opencode/plugins/commandcode-go.ts
```

Restart opencode. The plugin is auto-discovered from the global plugins directory.

## Upgrading from OpenCode V1

> **Not upgrading?** If you are staying on opencode V1, do **not** install v0.2.0+. Pin the last V1-compatible release, [`v0.1.0`](https://github.com/LaynePeng/opencode-commandcode-plan-auth/tree/v0.1.0), and keep the V1 `plugin` config shape below.

OpenCode V2 changes the **plugin API** (one of the intentional breaking changes in the [V2 migration guide](https://opencode.ai/v2/docs/migrate-v1)). **V1 plugins do not run in V2.** Update both the plugin and your configuration:

1. **Make sure you are on OpenCode V2**, then rebuild/upgrade this plugin. v0.2.0+ targets the V2 `Plugin.define` API.

   ```bash
   cd ~/codes/commnd-go-plugin      # or wherever you cloned it
   git pull
   npm install && npm run build
   ```

2. **Replace the plugin file.** The old symlink still points at the same path, but the old V1 build is incompatible — recreate it so it points at the new V2 build:

   ```bash
   rm -f ~/.config/opencode/plugins/commandcode-go.ts
   ln -s "$PWD/dist/index.js" ~/.config/opencode/plugins/commandcode-go.ts
   ```

   If you installed from npm, move the entry from the V1 `plugin` array to the V2 `plugins` array:

   ```jsonc
   {
     // before (V1)
     "plugin": [["opencode-commandcode-plan-auth", { "zdr": false }]],
     // after (V2)
     "plugins": [
       { "package": "opencode-commandcode-plan-auth", "options": { "zdr": false } }
     ]
   }
   ```

3. **Reconnect the provider.** V1 stored the `/connect` key in `~/.local/share/opencode/auth.json` under `commandcode-go`; V2 moves credentials into `~/.local/share/opencode/account.json` and binds them to an *integration*. Catalog providers migrate automatically, but the Command Code integration did not exist in V1, so run:

   ```text
   /connect   →   Command Code Go   →   paste your API key
   ```

   Or skip `/connect` and start opencode with `CMD_API_KEY=...`.

4. **Restart the server after changing plugins.** OpenCode caches loaded plugin modules in the running server process, and that cache is not invalidated by editing or re-symlinking the file. A hot reload is not enough when the plugin's dependencies changed:

   ```bash
   opencode service restart
   ```

   Then verify:

   ```bash
   opencode plugin list                    # commandcode-go should be listed with its local source
   opencode models | grep commandcode-go   # 70+ models
   ```

5. **Model catalog cache (optional).** The plugin caches the live catalog at `~/.cache/opencode-commandcode-plan-auth/models.json` (24h TTL). It is unrelated to the V1→V2 upgrade; delete it only to force a refetch:

   ```bash
   rm -f ~/.cache/opencode-commandcode-plan-auth/models.json
   ```

### Upgrade symptoms

| Symptom | Cause / fix |
| --- | --- |
| `Plugin must export a default definition with an id and an effect or setup function.` | A V1 plugin build is being loaded. Rebuild v0.2.0+, then `opencode service restart`. |
| `Cannot find package '@opencode/plugin'` | The plugin's dependency is not resolvable from the plugin location. Run `npm install` in the repo (source install) or install the package into `~/.config/opencode`. |
| Error persists right after rebuilding | The running server cached the old module. Run `opencode service restart` (or fully quit and reopen opencode). |

## Usage

1. Subscribe to any Command Code plan with API access ([Provider](https://commandcode.ai/pricing), GOAT, Pro, Max or Team) and create an API key in [Studio](https://commandcode.ai/studio/).
2. Run `/connect` in opencode, select **Command Code Go**, and paste your API key.
3. Run `/models` and pick a model, e.g. `commandcode-go/claude-sonnet-5` or `commandcode-go/deepseek/deepseek-v4-flash`.

Set a default model in your config:

```jsonc
{
  "model": "commandcode-go/claude-sonnet-5"
}
```

Or authenticate without `/connect`:

```bash
CMD_API_KEY=... opencode          # primary
COMMANDCODE_API_KEY=... opencode  # fallback, lower precedence than CMD_API_KEY
```

## Pricing & prompt caching

Per-model costs shown by opencode (and used for its usage/cost display) are the **authoritative Command Code rates**, extracted from the official `command-code` package where published, falling back to models.dev upstream rates (Command Code bills at underlying rates with no markup). Cached input is billed at the much cheaper `cacheHit` rate — e.g. `claude-sonnet-5` is $2/M for input but $0.2/M for cached input, so prompt caching pays off on long sessions.

Caching behavior, verified against the live request path:

- **Claude models** (`/v1/messages`): opencode automatically places `cache_control: {"type": "ephemeral"}` breakpoints on the system prompt and conversation prefix. Prompt caching works out of the box — no configuration needed.
- **OpenAI-compatible models** (`/v1/chat/completions`): OpenAI/open-model prefix caching is automatic upstream.
- Command Code meters cache reads and writes separately (the official rate table carries `cacheWrite5m`/`cacheWrite1h`/`cacheHit`); the plugin maps the 5-minute write rate and the hit rate to opencode's cache read/write cost fields.

## Plugin options

```jsonc
{
  "plugins": [
    {
      "package": "opencode-commandcode-plan-auth",
      "options": { "zdr": false }
    }
  ]
}
```

| Option              | Type    | Default      | Description                                                        |
| ------------------- | ------- | ------------ | ------------------------------------------------------------------ |
| `zdr`               | boolean | `true`       | Send `x-cmd-zdr: 1` on every request. See [ZDR](#zero-data-retention). |
| `fetchModels`       | boolean | `true`       | Fetch the live model catalog. Set to `false` to use only the bundled snapshot. |
| `baseURL`           | string  | Command Code API | Override the provider API base URL (e.g. for a proxy).          |
| `modelsCacheTtlMs`  | number  | `86400000`   | Disk cache TTL for the model catalog, in milliseconds.             |

## Overriding models

Everything the plugin registers can be overridden per provider/model in `opencode.json`. Your entries are applied on top of the plugin's registration:

```jsonc
{
  "providers": {
    "commandcode-go": {
      "settings": { "timeout": 600000 },
      "headers": { "x-cmd-zdr": "0" },
      "models": {
        "claude-sonnet-5": {
          "name": "Claude Sonnet 5 (my alias)",
          "limit": { "context": 1000000, "output": 64000 }
        }
      }
    }
  }
}
```

To trim the model picker, disable models you do not want with `disabled: true`:

```jsonc
{
  "providers": {
    "commandcode-go": {
      "models": {
        "gpt-5.4": { "disabled": true }
      }
    }
  }
}
```

## Zero data retention

Command Code can route requests only through upstreams that enforce zero data retention and no prompt training. The plugin sends `x-cmd-zdr: 1` by default to enable this.

Notes:

- A small number of models have no ZDR-capable upstream; those requests fail with a `422 cmd_zdr_no_providers` error rather than falling back. Pick another model or set `{"zdr": false}`.
- Anthropic models on `/v1/messages` are already zero-data-retention at the account level, so the header is a no-op there.
- ZDR routing can change which upstream serves a request and may cost more for some models.

## How it works

The plugin default-exports `Plugin.define({ id: "commandcode-go", setup })` and registers everything through V2 domain transforms at startup:

- **Provider** (`ctx.provider.transform`) — registers `commandcode-go` with `package` set to the OpenAI-compatible runtime, `settings.baseURL`, the ZDR `headers`, and the full model catalog. `claude*` models carry a model-level `package` override pointing at the Anthropic runtime, so Claude goes to `/messages` and everything else to `/chat/completions`.
- **Model catalog** — fetched from the public `GET /provider/v1/models` endpoint, cached at `~/.cache/opencode-commandcode-plan-auth/models.json`, and falls back to a bundled snapshot when offline.
- **Auth** (`ctx.integration.transform`) — registers the `commandcode-go` integration with a `key` method (drives `/connect`) and an `env` method (`CMD_API_KEY` / `COMMANDCODE_API_KEY`). The provider links to the integration with `integrationID`, so opencode applies the credential automatically.

## Troubleshooting

- **Provider or models missing** — run `opencode models commandcode-go`. Check `~/.local/share/opencode/log/` for `failed to load plugin` and `commandcode` entries, and confirm the plugin file loads: `bun run ~/.config/opencode/plugins/commandcode-go.ts` should print nothing and exit 0.
- **`failed to load plugin` with `Plugin must export a default definition`** — you are on opencode V2 running a V1 plugin build. Rebuild this package (it uses the V2 `Plugin.define` API), make sure `@opencode/plugin` is resolvable next to the plugin, and restart the service (`opencode service restart`) — see [Upgrading from OpenCode V1](#upgrading-from-opencode-v1).
- **`400` on a Claude model** — make sure the model id starts with `claude`; the plugin routes Claude models to the Anthropic package. A `400` pointing you at `/v1/messages` means a Claude model was sent to the OpenAI endpoint.
- **`422 cmd_zdr_no_providers`** — the model has no ZDR-capable upstream. Disable ZDR or use another model.
- **`403 upgrade_required`** — you are on the Go plan, the only plan without API access.
- **Stale model list** — delete `~/.cache/opencode-commandcode-plan-auth/models.json` and restart opencode.

## Development

```bash
npm install
npm run build        # build dist/
npm run typecheck
```

The model metadata snapshot (`src/metadata.ts`) and offline fallback (`src/fallback.ts`) are generated from the live catalog plus models.dev data. Refresh them when Command Code ships new models.

## License

[MIT](./LICENSE)
