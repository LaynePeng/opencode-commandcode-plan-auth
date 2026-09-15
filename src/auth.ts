import type { AuthHook } from "@opencode-ai/plugin"
import { PROVIDER_ID } from "./constants"

/**
 * Wires Command Code into opencode's /connect flow.
 *
 * The key entered by the user is stored in opencode's auth store and is
 * automatically applied as `apiKey` to every request, for both the
 * OpenAI-compatible and the Anthropic SDK routes.
 */
export const authHook: AuthHook = {
  provider: PROVIDER_ID,
  methods: [
    {
      type: "api",
      label: "Command Code (API key)",
    },
  ],
}
