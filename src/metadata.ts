/**
 * Curated model metadata for Command Code models.
 *
 * Costs are the authoritative Command Code rates (per 1M tokens) extracted from the
 * official command-code package where published, falling back to models.dev upstream
 * rates (Command Code bills at underlying upstream rates with no markup). Cache
 * read/write rates mirror what the gateway meters: cached input is billed at the
 * much cheaper cacheHit rate, so prompt caching pays off.
 *
 * Limits and capabilities come from models.dev plus the public
 * /provider/v1/models endpoint. Unknown future models fall back to the family rules
 * below. Users can override any of this per model in opencode.json under
 * provider["commandcode-go"].models.
 */

export type ModelMeta = {
  /** max output tokens */
  output: number
  reasoning?: boolean
  toolCall?: boolean
  temperature?: boolean
  /** accepts image attachments */
  attachment?: boolean
  /** field carrying interleaved reasoning tokens on the OpenAI-compatible endpoint */
  interleaved?: "reasoning_content"
  /** USD per 1M tokens */
  cost?: { input: number; output: number; cache_read?: number; cache_write?: number }
  release_date?: string
}

/** Metadata for every model in the Command Code catalog at build time. */
export const KNOWN_MODELS: Record<string, ModelMeta> = {
  "claude-sonnet-5": { output: 128000, reasoning: true, attachment: true, release_date: "2026-06-29", cost: { input: 2.0, output: 10.0, cache_read: 0.2, cache_write: 2.5 } },
  "claude-sonnet-4-6": { output: 128000, reasoning: true, temperature: true, attachment: true, release_date: "2026-02-17", cost: { input: 3.0, output: 15.0, cache_read: 0.3, cache_write: 3.75 } },
  "claude-fable-5-1": { output: 128000, reasoning: true, attachment: true, release_date: "2026-09-01", cost: { input: 10.0, output: 50.0, cache_read: 0.25, cache_write: 12.5 } },
  "claude-fable-5": { output: 128000, reasoning: true, attachment: true, release_date: "2026-06-07", cost: { input: 10.0, output: 50.0, cache_read: 1.0, cache_write: 12.5 } },
  "claude-opus-5": { output: 128000, reasoning: true, attachment: true, release_date: "2026-07-24", cost: { input: 5.0, output: 25.0, cache_read: 0.5, cache_write: 6.25 } },
  "claude-opus-4-8": { output: 128000, reasoning: true, attachment: true, release_date: "2026-05-28", cost: { input: 5.0, output: 25.0, cache_read: 0.5, cache_write: 6.25 } },
  "claude-opus-4-7": { output: 128000, reasoning: true, attachment: true, release_date: "2026-04-14", cost: { input: 5.0, output: 25.0, cache_read: 0.5, cache_write: 6.25 } },
  "claude-haiku-4-5-20251001": { output: 64000, reasoning: true, temperature: true, attachment: true, release_date: "2025-10-15", cost: { input: 1.0, output: 5.0, cache_read: 0.1, cache_write: 1.25 } },
  "gpt-5.6-sol": { output: 128000, reasoning: true, attachment: true, release_date: "2026-07-09", cost: { input: 5.0, output: 30.0, cache_read: 0.5, cache_write: 6.25 } },
  "gpt-5.6-terra": { output: 128000, reasoning: true, attachment: true, release_date: "2026-07-09", cost: { input: 2.0, output: 12.0, cache_read: 0.2, cache_write: 2.5 } },
  "gpt-5.6-luna": { output: 128000, reasoning: true, attachment: true, release_date: "2026-07-09", cost: { input: 0.2, output: 1.2, cache_read: 0.02, cache_write: 0.25 } },
  "gpt-5.5": { output: 128000, reasoning: true, attachment: true, release_date: "2026-04-23", cost: { input: 5.0, output: 30.0, cache_read: 0.5 } },
  "gpt-5.4": { output: 128000, reasoning: true, temperature: true, attachment: true, release_date: "2026-03-05", cost: { input: 2.5, output: 15.0, cache_read: 0.25 } },
  "gpt-5.3-codex": { output: 128000, reasoning: true, temperature: true, attachment: true, release_date: "2026-02-05", cost: { input: 2.0, output: 8.0, cache_read: 0.5 } },
  "gpt-5.4-mini": { output: 128000, reasoning: true, temperature: true, attachment: true, release_date: "2026-03-17", cost: { input: 0.75, output: 4.5, cache_read: 0.075 } },
  "deepseek/deepseek-v4-pro": { output: 384000, reasoning: true, temperature: true, interleaved: "reasoning_content", release_date: "2026-08-12", cost: { input: 0.435, output: 0.87, cache_read: 0.003625 } },
  "deepseek/deepseek-v4-flash": { output: 384000, reasoning: true, temperature: true, attachment: true, interleaved: "reasoning_content", release_date: "2026-09-10", cost: { input: 0.15, output: 0.6, cache_read: 0.003 } },
  "deepseek/deepseek-v4-flash-vision-exp": { output: 384000, reasoning: true, temperature: true, attachment: true, interleaved: "reasoning_content", release_date: "2026-09-10", cost: { input: 0.15, output: 0.6, cache_read: 0.003 } },
  "deepseek/deepseek-v4-flash-fast": { output: 384000, reasoning: true, temperature: true, attachment: true, interleaved: "reasoning_content", release_date: "2026-09-10", cost: { input: 0.15, output: 0.6, cache_read: 0.003 } },
  "deepseek/deepseek-v4.1-flash": { output: 384000, reasoning: true, temperature: true, attachment: true, interleaved: "reasoning_content", release_date: "2026-09-10", cost: { input: 0.15, output: 0.6, cache_read: 0.003 } },
  "moonshotai/Kimi-K3": { output: 131072, reasoning: true, attachment: true, interleaved: "reasoning_content", release_date: "2026-07-16", cost: { input: 3.0, output: 15.0, cache_read: 0.3 } },
  "moonshotai/Kimi-K2.7-Code": { output: 262144, reasoning: true, attachment: true, interleaved: "reasoning_content", release_date: "2026-06-12", cost: { input: 0.95, output: 4, cache_read: 0.19 } },
  "moonshotai/Kimi-K2.7-Code-Highspeed": { output: 262144, reasoning: true, attachment: true, interleaved: "reasoning_content", release_date: "2026-06-12", cost: { input: 1.9, output: 8, cache_read: 0.38 } },
  "moonshotai/Kimi-K2.6": { output: 262144, reasoning: true, temperature: true, attachment: true, interleaved: "reasoning_content", release_date: "2026-04-21", cost: { input: 0.95, output: 4.0, cache_read: 0.16 } },
  "moonshotai/Kimi-K2.5": { output: 262144, reasoning: true, temperature: true, attachment: true, interleaved: "reasoning_content", release_date: "2026-04-21", cost: { input: 0.6, output: 3.0 } },
  "z-ai/glm-5.3-flash": { output: 131072, reasoning: true, temperature: true, attachment: true, interleaved: "reasoning_content", release_date: "2026-08-26", cost: { input: 0.075, output: 0.25, cache_read: 0.015, cache_write: 0 } },
  "zai-org/GLM-5.3": { output: 131072, reasoning: true, temperature: true, interleaved: "reasoning_content", release_date: "2026-08-14", cost: { input: 1.4, output: 4.4, cache_read: 0.26 } },
  "zai-org/GLM-5.2": { output: 131072, reasoning: true, temperature: true, interleaved: "reasoning_content", release_date: "2026-06-13", cost: { input: 1.4, output: 4.4, cache_read: 0.26, cache_write: 0 } },
  "zai-org/GLM-5.2-Fast": { output: 131072, reasoning: true, temperature: true, interleaved: "reasoning_content", release_date: "2026-06-13", cost: { input: 1.4, output: 4.4, cache_read: 0.26, cache_write: 0 } },
  "zai-org/GLM-5.1": { output: 131072, reasoning: true, temperature: true, interleaved: "reasoning_content", release_date: "2026-03-27", cost: { input: 1.4, output: 4.4, cache_read: 0.26, cache_write: 0 } },
  "zai-org/GLM-5": { output: 131072, reasoning: true, temperature: true, interleaved: "reasoning_content", release_date: "2026-02-11", cost: { input: 0.95, output: 3.15 } },
  "MiniMaxAI/MiniMax-M3": { output: 512000, reasoning: true, temperature: true, attachment: true, release_date: "2026-06-01", cost: { input: 0.3, output: 1.2, cache_read: 0.06 } },
  "MiniMaxAI/MiniMax-M2.7": { output: 131072, reasoning: true, temperature: true, release_date: "2026-03-18", cost: { input: 0.3, output: 1.2, cache_read: 0.06, cache_write: 0.375 } },
  "MiniMaxAI/MiniMax-M2.5": { output: 131072, reasoning: true, temperature: true, release_date: "2026-02-12", cost: { input: 0.5, output: 2.0 } },
  "xiaomi/mimo-v2.5-pro": { output: 131072, reasoning: true, temperature: true, interleaved: "reasoning_content", release_date: "2026-04-22", cost: { input: 0.435, output: 0.87, cache_read: 0.0036 } },
  "xiaomi/mimo-v2.5": { output: 131072, reasoning: true, temperature: true, attachment: true, interleaved: "reasoning_content", release_date: "2026-04-22", cost: { input: 0.14, output: 0.28, cache_read: 0.0028 } },
  "Qwen/Qwen3.8-Max-0902": { output: 131072, reasoning: true, temperature: true, attachment: true, interleaved: "reasoning_content", release_date: "2026-08-03", cost: { input: 1.77744, output: 5.33231, cache_read: 0.22218, cache_write: 2.22179 } },
  "Qwen/Qwen3.8-Max": { output: 131072, reasoning: true, temperature: true, attachment: true, interleaved: "reasoning_content", release_date: "2026-08-03", cost: { input: 1.77744, output: 5.33231, cache_read: 0.22218, cache_write: 2.22179 } },
  "Qwen/Qwen3.8-27B": { output: 131072, reasoning: true, temperature: true, interleaved: "reasoning_content" },
  "Qwen/Qwen3.8-Flash": { output: 131072, reasoning: true, attachment: true, interleaved: "reasoning_content", release_date: "2026-08-26", cost: { input: 0.11875, output: 0.40073, cache_read: 0.01187, cache_write: 0.14844 } },
  "Qwen/Qwen3.7-Max": { output: 65536, reasoning: true, temperature: true, release_date: "2026-05-21", cost: { input: 2.5, output: 7.5, cache_read: 0.5, cache_write: 3.125 } },
  "Qwen/Qwen3.7-Plus": { output: 64000, reasoning: true, temperature: true, attachment: true, release_date: "2026-06-02", cost: { input: 0.5, output: 3, cache_read: 0.05, cache_write: 0.625 } },
  "Qwen/Qwen3.7-Flash": { output: 65536, reasoning: true, temperature: true, attachment: true, release_date: "2026-07-15", cost: { input: 0.02962, output: 0.1185, cache_read: 0.002962, cache_write: 0.03703 } },
  "Qwen/Qwen3.6-Max-Preview": { output: 65536, reasoning: true, temperature: true, release_date: "2026-04-20", cost: { input: 1.32, output: 7.9, cache_read: 0.132 } },
  "Qwen/Qwen3.6-Plus": { output: 65536, reasoning: true, temperature: true, attachment: true, release_date: "2026-04-02", cost: { input: 0.5, output: 3, cache_read: 0.05, cache_write: 0.625 } },
  "meituan/LongCat-2.0:free": { output: 131072, reasoning: true, temperature: true, interleaved: "reasoning_content", release_date: "2026-06-30", cost: { input: 0, output: 0 } },
  "stepfun/Step-3.7-Flash": { output: 256000, reasoning: true, temperature: true, attachment: true, interleaved: "reasoning_content", release_date: "2026-05-29", cost: { input: 0.185, output: 1.11, cache_read: 0.037 } },
  "stepfun/Step-3.5-Flash": { output: 256000, reasoning: true, temperature: true, interleaved: "reasoning_content", release_date: "2026-01-29", cost: { input: 0.1, output: 0.3, cache_read: 0.02 } },
  "tencent/hy3-paid": { output: 128000, reasoning: true, temperature: true, release_date: "2026-07-06", cost: { input: 0, output: 0, cache_read: 0, cache_write: 0 } },
  "tencent/hy4-preview": { output: 64000, reasoning: true, temperature: true, release_date: "2026-08-28", cost: { input: 0.834, output: 2.501, cache_read: 0.042 } },
  "google/gemini-3.8-flash": { output: 65536, reasoning: true, temperature: true, attachment: true, release_date: "2026-09-02", cost: { input: 0.75, output: 3.75, cache_read: 0.075 } },
  "google/gemini-3.7-flash": { output: 65536, reasoning: true, temperature: true, attachment: true, release_date: "2026-08-13", cost: { input: 0.75, output: 3.75, cache_read: 0.075 } },
  "google/gemini-3.6-flash": { output: 65536, reasoning: true, temperature: true, attachment: true, release_date: "2026-07-21", cost: { input: 0.75, output: 3.75, cache_read: 0.075 } },
  "google/gemini-3.5-flash": { output: 65536, reasoning: true, temperature: true, attachment: true, release_date: "2026-05-19", cost: { input: 1.5, output: 9, cache_read: 0.15 } },
  "google/gemini-3.5-flash-lite": { output: 65536, reasoning: true, temperature: true, attachment: true, release_date: "2026-07-21", cost: { input: 0.3, output: 2.5, cache_read: 0.03 } },
  "google/gemini-3.1-flash-lite": { output: 65536, reasoning: true, temperature: true, attachment: true, release_date: "2026-05-07", cost: { input: 0.25, output: 1.5, cache_read: 0.025 } },
  "sakana/fugu-ultra": { output: 1000000, reasoning: true, attachment: true, release_date: "2026-06-15", cost: { input: 5, output: 30, cache_read: 0.5 } },
  "nvidia/nemotron-3-ultra-550b-a55b": { output: 32768 },
  "thinkingmachines/inkling": { output: 65536, reasoning: true, temperature: true, cost: { input: 1.87, output: 4.68, cache_read: 0.374 } },
  "thinkingmachines/inkling-small": { output: 65536, reasoning: true, temperature: true },
  "inclusionai/ling-3.0-flash-sante:free": { output: 32768, cost: { input: 0, output: 0 } },
  "meta/muse-spark-1.1": { output: 131072, reasoning: true, temperature: true, attachment: true, release_date: "2026-04-08", cost: { input: 1.25, output: 4.25, cache_read: 0.15 } },
  "meta/muse-spark-1.2": { output: 131072, reasoning: true, temperature: true, attachment: true, release_date: "2026-08-05", cost: { input: 1.25, output: 4.25, cache_read: 0.15 } },
  "meta/muse-spark-1.2-contributor": { output: 131072, reasoning: true, temperature: true, attachment: true, release_date: "2026-08-05", cost: { input: 0.1, output: 0.2, cache_read: 0.002 } },
  "meta/muse-spark-1.3": { output: 131072, reasoning: true, temperature: true, attachment: true, release_date: "2026-09-02", cost: { input: 1.25, output: 4.25, cache_read: 0.15 } },
  "meta/muse-spark-1.3-contributor": { output: 131072, reasoning: true, temperature: true, attachment: true, release_date: "2026-09-02", cost: { input: 0.1, output: 0.2, cache_read: 0.002 } },
  "xai/grok-4.5": { output: 500000, reasoning: true, temperature: true, attachment: true, release_date: "2026-07-08", cost: { input: 2, output: 6, cache_read: 0.3 } },
  "xai/grok-4.6": { output: 500000, reasoning: true, temperature: true, attachment: true, release_date: "2026-08-12", cost: { input: 2, output: 6, cache_read: 0.5 } },
  "poolside/laguna-s-2.1-free": { output: 32768, reasoning: true, temperature: true, cost: { input: 0, output: 0 } },
}

/** Prefix rules applied to models not present in KNOWN_MODELS (new catalog entries). */
const FAMILY_RULES: Array<{ prefix: string; meta: ModelMeta }> = [
  { prefix: "claude", meta: { output: 128000, reasoning: true, temperature: true, attachment: true } },
  { prefix: "gpt-", meta: { output: 128000, reasoning: true, attachment: true } },
  { prefix: "deepseek/", meta: { output: 65536, reasoning: true, temperature: true, interleaved: "reasoning_content" } },
  { prefix: "moonshotai/Kimi", meta: { output: 131072, reasoning: true, temperature: true, attachment: true, interleaved: "reasoning_content" } },
  { prefix: "Qwen/Qwen3.8", meta: { output: 131072, reasoning: true, temperature: true, interleaved: "reasoning_content" } },
  { prefix: "Qwen/", meta: { output: 65536, reasoning: true, temperature: true } },
  { prefix: "zai-org/GLM", meta: { output: 131072, reasoning: true, temperature: true, interleaved: "reasoning_content" } },
  { prefix: "z-ai/", meta: { output: 131072, reasoning: true, temperature: true, interleaved: "reasoning_content" } },
  { prefix: "MiniMaxAI/", meta: { output: 131072, reasoning: true, temperature: true } },
  { prefix: "xiaomi/", meta: { output: 131072, reasoning: true, temperature: true, interleaved: "reasoning_content" } },
  { prefix: "google/gemini", meta: { output: 65536, reasoning: true, temperature: true, attachment: true } },
  { prefix: "xai/grok", meta: { output: 131072, reasoning: true, attachment: true } },
  { prefix: "meta/", meta: { output: 131072, reasoning: true } },
]

const DEFAULT_META: ModelMeta = { output: 32768, toolCall: true }

export function resolveModelMeta(id: string): ModelMeta {
  const known = KNOWN_MODELS[id]
  if (known) return known
  for (const rule of FAMILY_RULES) {
    if (id.startsWith(rule.prefix)) return rule.meta
  }
  return DEFAULT_META
}
