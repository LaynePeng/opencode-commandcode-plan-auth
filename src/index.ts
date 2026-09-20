import { Plugin } from "@opencode/plugin"
import { registerAuth } from "./auth"
import { PROVIDER_ID, PROVIDER_NAME } from "./constants"
import { registerProvider } from "./config"
import { parseOptions } from "./options"

/**
 * opencode V2 plugin that adds the Command Code (CommandCode) Provider API as a
 * first-class provider:
 *
 * - registers the `commandcode-go` provider with the right package routing
 *   (Anthropic `/messages` for Claude models, OpenAI-compatible
 *   `/chat/completions` for everything else)
 * - discovers the live model catalog from `GET /provider/v1/models`
 *   (cached on disk, bundled snapshot as offline fallback)
 * - integrates with `/connect` for API key entry, and honors
 *   `CMD_API_KEY` / `COMMANDCODE_API_KEY` environment variables
 * - sends the `x-cmd-zdr: 1` zero-data-retention header by default
 *
 * V2 plugin entrypoint: a default-exported definition with an `id` and
 * `setup(ctx)`. Registration happens through domain transforms.
 */
export default Plugin.define({
  id: PROVIDER_ID,
  async setup(ctx) {
    const opts = parseOptions(ctx.options)

    await registerAuth(ctx)

    try {
      const { count, source } = await registerProvider(ctx, opts)
      console.log(`[${PROVIDER_ID}] registered ${PROVIDER_NAME} provider with ${count} models (catalog: ${source})`)
    } catch (error) {
      console.error(
        `[${PROVIDER_ID}] failed to register provider: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  },
})

export type { CommandGoOptions } from "./options"
