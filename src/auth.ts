import type { Plugin } from "@opencode/plugin"
import { ENV_KEYS, INTEGRATION_ID, KEY_METHOD_LABEL, PROVIDER_NAME } from "./constants"

/**
 * Wires Command Code into opencode V2's integration/connect flow.
 *
 * V1 exposed an `auth` hook with an `api` method. V2 moves authentication onto
 * integrations: the integration owns the credential and the connect methods,
 * and the provider links to it with `Provider.Info.integrationID`.
 *
 * - `key`  → the user pastes an API key via `/connect`.
 * - `env`  → `CMD_API_KEY` / `COMMANDCODE_API_KEY` work without `/connect`.
 */
export async function registerAuth(ctx: Plugin.Context): Promise<void> {
  await ctx.integration.transform((editor) => {
    editor.update(INTEGRATION_ID, (integration) => {
      integration.name = PROVIDER_NAME
    })
    editor.method.update({
      integrationID: INTEGRATION_ID,
      method: { type: "key", label: KEY_METHOD_LABEL },
    })
    editor.method.update({
      integrationID: INTEGRATION_ID,
      method: { type: "env", names: [...ENV_KEYS] },
    })
  })
}
