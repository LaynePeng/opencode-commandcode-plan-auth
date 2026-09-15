import type { Config } from "@opencode-ai/plugin"
import {
  ANTHROPIC_NPM,
  ANTHROPIC_PREFIX,
  DEFAULT_BASE_URL,
  ENV_KEYS,
  OPENAI_COMPATIBLE_NPM,
  PROVIDER_ID,
  PROVIDER_NAME,
  ZDR_HEADER,
} from "./constants"
import { FALLBACK_MODELS, type RawModel } from "./fallback"
import { resolveModelMeta } from "./metadata"
import { getModelCatalog } from "./models"
import type { CommandGoOptions } from "./options"

/**
 * A provider-level model entry in opencode.json shape.
 * `interleaved` is accepted by the opencode config schema but missing from the
 * SDK type, so it is added here.
 */
type ProviderModelEntry = {
  id?: string
  name?: string
  release_date?: string
  attachment?: boolean
  reasoning?: boolean
  temperature?: boolean
  tool_call?: boolean
  interleaved?: boolean | string | { field: string }
  cost?: { input: number; output: number; cache_read?: number; cache_write?: number }
  limit?: { context: number; output: number }
  status?: "alpha" | "beta" | "deprecated" | "active"
  options?: Record<string, unknown>
  headers?: Record<string, string>
  provider?: { npm: string }
}

export function mapModel(raw: RawModel): ProviderModelEntry {
  const meta = resolveModelMeta(raw.id)
  const entry: ProviderModelEntry = {
    name: raw.name && raw.name.length > 0 ? raw.name : raw.id,
    limit: {
      context: raw.context_length && raw.context_length > 0 ? raw.context_length : 128000,
      output: meta.output,
    },
  }
  if (meta.reasoning) entry.reasoning = true
  if (meta.toolCall === false) entry.tool_call = false
  if (meta.temperature) entry.temperature = true
  if (meta.attachment) entry.attachment = true
  if (meta.interleaved) entry.interleaved = meta.interleaved
  if (meta.cost) entry.cost = meta.cost
  if (meta.release_date) entry.release_date = meta.release_date
  // Command Code serves Claude models over the Anthropic /messages endpoint
  // and everything else over the OpenAI-compatible /chat/completions endpoint.
  if (raw.id.startsWith(ANTHROPIC_PREFIX)) {
    entry.provider = { npm: ANTHROPIC_NPM }
  }
  return entry
}

/**
 * Register the `commandcode-go` provider on the live merged config.
 *
 * Anything the user defined themselves in opencode.json takes precedence:
 * their provider options and their per-model entries are preserved, the
 * plugin only fills in what is missing.
 */
export async function registerProvider(
  cfg: Config,
  opts: CommandGoOptions,
): Promise<{ count: number; source: string }> {
  cfg.provider = cfg.provider ?? {}
  const existing = cfg.provider[PROVIDER_ID] ?? {}
  const existingOptions = (existing.options ?? {}) as Record<string, unknown>
  const existingHeaders =
    (existingOptions["headers"] as Record<string, string> | undefined) ?? undefined

  let raw: RawModel[]
  let source: string
  if (opts.fetchModels === false) {
    raw = FALLBACK_MODELS
    source = "bundled"
  } else {
    const catalog = await getModelCatalog(opts.modelsCacheTtlMs)
    raw = catalog.models
    source = catalog.source
  }

  const models: Record<string, ProviderModelEntry> = {}
  for (const model of raw) models[model.id] = mapModel(model)

  const headers: Record<string, string> = { ...(existingHeaders ?? {}) }
  if (opts.zdr !== false && headers[ZDR_HEADER] === undefined) headers[ZDR_HEADER] = "1"

  const options: Record<string, unknown> = {
    ...existingOptions,
    baseURL:
      typeof existingOptions["baseURL"] === "string" && existingOptions["baseURL"]
        ? existingOptions["baseURL"]
        : (opts.baseURL ?? DEFAULT_BASE_URL),
    headers,
  }

  cfg.provider[PROVIDER_ID] = {
    ...existing,
    name: existing.name ?? PROVIDER_NAME,
    npm: existing.npm ?? OPENAI_COMPATIBLE_NPM,
    env: existing.env ?? [...ENV_KEYS],
    options,
    // user-defined entries win over plugin-generated ones
    models: { ...models, ...existing.models },
  }

  return { count: Object.keys(cfg.provider[PROVIDER_ID]?.models ?? {}).length, source }
}
