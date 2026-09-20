import { Model, Provider, Integration, type Plugin } from "@opencode/plugin"
import {
  ANTHROPIC_PACKAGE,
  ANTHROPIC_PREFIX,
  DEFAULT_BASE_URL,
  INTEGRATION_ID,
  OPENAI_COMPATIBLE_PACKAGE,
  PROVIDER_ID,
  PROVIDER_NAME,
  ZDR_HEADER,
} from "./constants"
import { FALLBACK_MODELS, type RawModel } from "./fallback"
import { resolveModelMeta } from "./metadata"
import { getModelCatalog } from "./models"
import type { CommandGoOptions } from "./options"

/**
 * Convert one Command Code catalog entry into a V2 `Model.Info`.
 *
 * V1 routing via `provider.npm` / per-model `provider` maps to V2's `package`
 * field, which can be set per model. Claude models get the Anthropic package so
 * they are served over `/messages`; everything else inherits the provider-level
 * OpenAI-compatible package.
 */
export function mapModel(providerID: Provider.ID, raw: RawModel): Model.Info {
  const meta = resolveModelMeta(raw.id)
  const base = Model.Info.default(providerID, Model.ID.make(raw.id))

  const capabilities = {
    tools: meta.toolCall !== false,
    input: meta.attachment === true ? ["text", "image"] : ["text"],
    output: ["text"],
  }

  const cost = (
    meta.cost
      ? [
          {
            input: meta.cost.input,
            output: meta.cost.output,
            cache: {
              read: meta.cost.cache_read ?? 0,
              write: meta.cost.cache_write ?? 0,
            },
          },
        ]
      : []
  ) as unknown as Model.Info["cost"]

  const compatibility = meta.interleaved
    ? ({ reasoningField: meta.interleaved } as unknown as Model.Info["compatibility"])
    : undefined

  const pkg = raw.id.startsWith(ANTHROPIC_PREFIX) ? ANTHROPIC_PACKAGE : undefined

  return {
    ...base,
    name: raw.name && raw.name.length > 0 ? raw.name : raw.id,
    capabilities,
    limit: {
      context: raw.context_length && raw.context_length > 0 ? raw.context_length : 128000,
      output: meta.output,
    },
    time: { released: meta.release_date ? Date.parse(meta.release_date) : 0 },
    cost,
    ...(compatibility ? { compatibility } : {}),
    ...(pkg ? { package: pkg } : {}),
  }
}

/**
 * Register the `commandcode-go` provider on the live V2 provider registry.
 *
 * Registered through a provider transform, so it is replayed whenever the
 * registry rebuilds. User configuration in `providers["commandcode-go"]` is
 * applied by opencode on top of transform output and therefore still wins.
 */
export async function registerProvider(
  ctx: Plugin.Context,
  opts: CommandGoOptions,
): Promise<{ count: number; source: string }> {
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

  const providerID = Provider.ID.make(PROVIDER_ID)
  const models = raw.map((model) => mapModel(providerID, model))

  const baseURL = opts.baseURL ?? DEFAULT_BASE_URL
  const headers: Record<string, string> = {}
  if (opts.zdr !== false) headers[ZDR_HEADER] = "1"

  await ctx.provider.transform((editor) => {
    editor.add({
      info: {
        ...Provider.Info.empty(providerID),
        name: PROVIDER_NAME,
        activation: "enabled",
        package: OPENAI_COMPATIBLE_PACKAGE,
        integrationID: Integration.ID.make(INTEGRATION_ID),
        settings: { baseURL },
        headers,
      },
      models,
    })
  })

  return { count: models.length, source }
}
