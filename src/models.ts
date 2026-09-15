import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { homedir } from "node:os"
import {
  DEFAULT_MODELS_CACHE_TTL_MS,
  DEFAULT_MODELS_URL,
  MODELS_FETCH_TIMEOUT_MS,
} from "./constants"
import { FALLBACK_MODELS, type RawModel } from "./fallback"

type CacheShape = {
  fetchedAt: number
  models: RawModel[]
}

function cacheFile(): string {
  const root = process.env.XDG_CACHE_HOME ?? join(homedir(), ".cache")
  return join(root, "opencode-commandcode-plan-auth", "models.json")
}

async function readCache(): Promise<CacheShape | undefined> {
  try {
    const parsed = JSON.parse(await readFile(cacheFile(), "utf8")) as CacheShape
    if (!Array.isArray(parsed?.models)) return undefined
    return parsed
  } catch {
    return undefined
  }
}

async function writeCache(models: RawModel[]): Promise<void> {
  try {
    const file = cacheFile()
    await mkdir(join(file, ".."), { recursive: true })
    await writeFile(file, JSON.stringify({ fetchedAt: Date.now(), models } satisfies CacheShape))
  } catch {
    // Cache is best-effort; never fail because of it.
  }
}

async function fetchModels(): Promise<RawModel[] | undefined> {
  try {
    const res = await fetch(DEFAULT_MODELS_URL, {
      signal: AbortSignal.timeout(MODELS_FETCH_TIMEOUT_MS),
      headers: { accept: "application/json" },
    })
    if (!res.ok) return undefined
    const body = (await res.json()) as { data?: RawModel[] }
    if (!Array.isArray(body?.data)) return undefined
    return body.data.filter((m) => typeof m?.id === "string" && m.id.length > 0)
  } catch {
    return undefined
  }
}

export type CatalogSource = "cache" | "live" | "stale-cache" | "fallback"

export type Catalog = {
  models: RawModel[]
  source: CatalogSource
}

/**
 * Resolve the Command Code model catalog.
 *
 * Order: fresh disk cache -> live API -> stale cache -> bundled snapshot.
 */
export async function getModelCatalog(ttlMs = DEFAULT_MODELS_CACHE_TTL_MS): Promise<Catalog> {
  const cached = await readCache()
  if (cached && Date.now() - cached.fetchedAt < ttlMs) {
    return { models: cached.models, source: "cache" }
  }

  const fetched = await fetchModels()
  if (fetched) {
    await writeCache(fetched)
    return { models: fetched, source: "live" }
  }
  if (cached) return { models: cached.models, source: "stale-cache" }
  return { models: FALLBACK_MODELS, source: "fallback" }
}
