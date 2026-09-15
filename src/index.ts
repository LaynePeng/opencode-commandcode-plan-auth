import type { Plugin } from "@opencode-ai/plugin"
import { authHook } from "./auth"
import { PROVIDER_ID, PROVIDER_NAME } from "./constants"
import { registerProvider } from "./config"
import { parseOptions } from "./options"

/**
 * opencode plugin that adds the Command Code (CommandCode) Provider API as a
 * first-class provider:
 *
 * - registers the `commandcode-go` provider with the right SDK routing
 *   (Anthropic `/messages` for Claude models, OpenAI-compatible
 *   `/chat/completions` for everything else)
 * - discovers the live model catalog from `GET /provider/v1/models`
 *   (cached on disk, bundled snapshot as offline fallback)
 * - integrates with `/connect` for API key entry, and honors
 *   `CMD_API_KEY` / `COMMANDCODE_API_KEY` environment variables
 * - sends the `x-cmd-zdr: 1` zero-data-retention header by default
 */
export const CommandGoAuthPlugin: Plugin = async ({ client }, options) => {
  const opts = parseOptions(options)

  const log = async (level: "info" | "error", message: string) => {
    try {
      await client.app.log({
        body: { service: "opencode-commandgo-auth", level, message },
      })
    } catch {
      // client logging is best-effort
    }
  }

  return {
    config: async (cfg) => {
      try {
        const { count, source } = await registerProvider(cfg, opts)
        await log("info", `registered ${PROVIDER_NAME} provider with ${count} models (catalog: ${source})`)
      } catch (error) {
        await log(
          "error",
          `failed to register provider: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    },
    auth: authHook,
  }
}

export default CommandGoAuthPlugin

// NOTE: opencode's plugin loader requires every module export to be a function
// (or a `{ server }` module object). Do not export constants from this entry.

export type { CommandGoOptions } from "./options"
