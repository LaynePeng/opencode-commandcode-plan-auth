export const PROVIDER_ID = "commandcode-go"

/** Integration that owns the Command Code credential and connect methods. */
export const INTEGRATION_ID = "commandcode-go"

export const PROVIDER_NAME = "Command Code Go"

/** Command Code Provider API root (OpenAI-compatible: /chat/completions, Anthropic: /messages). */
export const DEFAULT_BASE_URL = "https://api.commandcode.ai/provider/v1"

/** Public model catalog endpoint (no auth required). */
export const DEFAULT_MODELS_URL = "https://api.commandcode.ai/provider/v1/models"

/** Environment variables that can supply the API key without `/connect`. */
export const ENV_KEYS = ["CMD_API_KEY", "COMMANDCODE_API_KEY"] as const

/** Label shown for the API-key connect method. */
export const KEY_METHOD_LABEL = "Command Code (API key)"

/**
 * opencode V2 provider packages.
 *
 * Claude models are served over the Anthropic `/messages` endpoint, everything
 * else over the OpenAI-compatible `/chat/completions` endpoint. A single
 * provider can mix both: the provider default is the OpenAI-compatible package
 * and each `claude*` model overrides it with the Anthropic package.
 */
export const ANTHROPIC_PACKAGE = "@opencode/ai/providers/anthropic"
export const OPENAI_COMPATIBLE_PACKAGE = "@opencode/ai/providers/openai-compatible"

/** Models whose ids start with this prefix are served over the Anthropic /messages endpoint. */
export const ANTHROPIC_PREFIX = "claude"

/** Zero-data-retention routing header. */
export const ZDR_HEADER = "x-cmd-zdr"

export const DEFAULT_MODELS_CACHE_TTL_MS = 24 * 60 * 60 * 1000

export const MODELS_FETCH_TIMEOUT_MS = 5000
