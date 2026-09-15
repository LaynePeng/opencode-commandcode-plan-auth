# opencode-commandcode-plan-auth

[Command Code](https://commandcode.ai) (CommandCode) Provider API as a first-class [opencode](https://opencode.ai) provider.

Every top model — Claude, GPT, Gemini, DeepSeek, Kimi, GLM, MiniMax, Qwen and more — through one subscription, with the same `/connect` experience as any built-in provider.

## Features

- **Native `/connect` flow** — run `/connect`, pick *Command Code Go*, paste your API key. Done.
- **Live model discovery** — the full catalog is fetched from `GET /provider/v1/models` at startup, cached on disk (24h TTL), with a bundled snapshot as offline fallback.
- **Dual-endpoint routing** — Command Code serves Claude models over the Anthropic `/v1/messages` endpoint and everything else over the OpenAI-compatible `/v1/chat/completions` endpoint. The plugin wires each model to the right SDK automatically (`@ai-sdk/anthropic` vs `@ai-sdk/openai-compatible`), so Claude and open models both just work.
- **Rich model metadata** — context/output limits, reasoning capability, vision support, interleaved-reasoning field and per-model costs (official Command Code rates where published, models.dev upstream rates otherwise).
- **Zero data retention by default** — sends `x-cmd-zdr: 1` on every request so traffic only routes through ZDR-capable upstreams. Opt out with `{"zdr": false}`.
- **Environment variable auth** — `CMD_API_KEY` or `COMMANDCODE_API_KEY` work without `/connect`.
- **User config always wins** — anything you define yourself under `provider["commandcode-go"]` in `opencode.json` overrides what the plugin injects.

## Install

### From source

```bash
git clone https://github.com/LaynePeng/opencode-commandcode-plan-auth.git
cd opencode-commandcode-plan-auth
npm install && npm run build
mkdir -p ~/.config/opencode/plugins
ln -s "$PWD/dist/index.js" ~/.config/opencode/plugins/commandcode-go.ts
```

Restart opencode. The plugin is auto-discovered from the global plugins directory.

### From npm (once published)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-commandcode-plan-auth"]
}
```

## Usage

1. Subscribe to any Command Code plan with API access ([Provider](https://commandcode.ai/pricing), GOAT, Pro, Max or Team) and create an API key in [Studio](https://commandcode.ai/studio/).
2. Run `/connect` in opencode, select **Command Code Go**, and paste your API key.
3. Run `/models` and pick a model, e.g. `commandcode-go/claude-sonnet-5` or `commandcode-go/deepseek/deepseek-v4-flash`.

Set a default model in your config:

```json
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
- **OpenAI-compatible models** (`/v1/chat/completions`): opencode sends `x-session-affinity` and `X-Session-Id` headers on every request, so the gateway can route a session's traffic to the same upstream and improve prefix-cache hit rates. OpenAI/open-model prefix caching is otherwise automatic upstream.
- Command Code meters cache reads and writes separately (the official rate table carries `cacheWrite5m`/`cacheWrite1h`/`cacheHit`); the plugin maps the 5-minute write rate and the hit rate to opencode's `cache_read`/`cache_write` cost fields.

## Plugin options

```json
{
  "plugin": [
    ["opencode-commandcode-plan-auth", { "zdr": false }]
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

Everything the plugin injects can be overridden per model in `opencode.json`. Your entries replace the plugin's for the same model id:

```json
{
  "provider": {
    "commandcode-go": {
      "options": { "timeout": 600000 },
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

Use `blacklist` / `whitelist` on the provider to trim the model picker, e.g.:

```json
{
  "provider": {
    "commandcode-go": {
      "whitelist": ["claude-sonnet-5", "deepseek/deepseek-v4-flash", "zai-org/GLM-5.3"]
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

The plugin registers a `commandcode-go` provider on opencode's merged config at startup:

- Claude models (`claude*`) get `provider.npm = "@ai-sdk/anthropic"`, which targets `POST {baseURL}/messages` and carries `cache_control` breakpoints for prompt caching.
- Everything else uses `@ai-sdk/openai-compatible`, which targets `POST {baseURL}/chat/completions`.
- The API key from `/connect` (stored in opencode's auth store) or `CMD_API_KEY`/`COMMANDCODE_API_KEY` is applied automatically as `apiKey` on both SDKs (`Authorization: Bearer` on the OpenAI route, `x-api-key` on the Anthropic route — both accepted by Command Code).
- The model catalog is fetched from the public `GET /provider/v1/models` endpoint, cached at `~/.cache/opencode-commandcode-plan-auth/models.json`, and falls back to a bundled snapshot when offline.

## Troubleshooting

- **Provider or models missing** — run `opencode models commandcode-go`. Check `~/.local/share/opencode/log/` for `opencode-commandcode-plan-auth` entries, and confirm the plugin file loads: `bun run ~/.config/opencode/plugins/commandcode-go.ts` should print nothing and exit 0.
- **`400` on a Claude model** — make sure the model id starts with `claude`; the plugin routes on that prefix. A `400` pointing you at `/v1/messages` means a Claude model was sent to the OpenAI endpoint.
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
