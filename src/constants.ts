export const PROVIDER_ID = "commandcode-go"

export const PROVIDER_NAME = "Command Code Go"

/** Command Code Provider API root (OpenAI-compatible: /chat/completions, Anthropic: /messages). */
export const DEFAULT_BASE_URL = "https://api.commandcode.ai/provider/v1"

/** Public model catalog endpoint (no auth required). */
export const DEFAULT_MODELS_URL = "https://api.commandcode.ai/provider/v1/models"

/**
 * Primary API key environment variable.
 *
 * NOTE: opencode only auto-propagates the env value as `apiKey` when a provider
 * declares exactly ONE env var, so this list must stay single-entry.
 * `COMMANDCODE_API_KEY` is honored as a fallback via the config hook instead.
 */
export const ENV_KEYS = ["CMD_API_KEY"] as const

/** Alternative API key environment variable, applied as a default by the config hook. */
export const FALLBACK_ENV_KEY = "COMMANDCODE_API_KEY"

/** SDK packages used per model family. */
export const ANTHROPIC_NPM = "@ai-sdk/anthropic"
export const OPENAI_COMPATIBLE_NPM = "@ai-sdk/openai-compatible"

/** Models whose ids start with this prefix are served over the Anthropic /messages endpoint. */
export const ANTHROPIC_PREFIX = "claude"

/** Zero-data-retention routing header. */
export const ZDR_HEADER = "x-cmd-zdr"

export const DEFAULT_MODELS_CACHE_TTL_MS = 24 * 60 * 60 * 1000

export const MODELS_FETCH_TIMEOUT_MS = 5000
