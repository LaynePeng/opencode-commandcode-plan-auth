export type CommandGoOptions = {
  /** Disable the zero-data-retention routing header. Default: enabled. */
  zdr?: boolean
  /** Skip live model discovery and use the bundled snapshot only. Default: false. */
  fetchModels?: boolean
  /** Override the provider API base URL. */
  baseURL?: string
  /** Model catalog cache TTL in milliseconds. Default: 24 hours. */
  modelsCacheTtlMs?: number
}

export function parseOptions(raw: unknown): CommandGoOptions {
  if (!raw || typeof raw !== "object") return {}
  const input = raw as Record<string, unknown>
  const out: CommandGoOptions = {}
  if (typeof input.zdr === "boolean") out.zdr = input.zdr
  if (typeof input.fetchModels === "boolean") out.fetchModels = input.fetchModels
  if (typeof input.baseURL === "string" && input.baseURL.length > 0) out.baseURL = input.baseURL
  if (
    typeof input.modelsCacheTtlMs === "number" &&
    Number.isFinite(input.modelsCacheTtlMs) &&
    input.modelsCacheTtlMs >= 0
  ) {
    out.modelsCacheTtlMs = input.modelsCacheTtlMs
  }
  return out
}
