import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible";

/**
 * Provider that connects the AI SDK to the Lovable AI Gateway.
 * Usage: const gateway = createLovableAiGatewayProvider(key); gateway("openai/gpt-5.5")
 */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}
