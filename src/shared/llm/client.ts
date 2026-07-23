import { getSetting } from "../storage";
import { callMistral, callOpenAI, callAnthropic, callGemini, ProviderCallOptions } from "./providers";
import type { ProviderID } from "../types";

export interface CallLLMOptions {
  apiKey?: string;
  model?: string;
  provider?: ProviderID;
}

export async function callLLM(
  prompt: string,
  options?: CallLLMOptions,
): Promise<string> {
  const activeProvider = options?.provider || await getSetting("activeProvider");
  const providers = await getSetting("providers");
  const providerConfig = providers[activeProvider];

  const apiKeysStr = (options?.apiKey ?? providerConfig?.apiKeys ?? "").trim();
  const apiKeys = apiKeysStr.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);
  
  if (apiKeys.length === 0) {
    throw new Error("missing_api_key");
  }

  const selectedModel = options?.model || providerConfig?.selectedModel || "";

  let lastError: Error | null = null;
  let attempt = 0;
  const maxAttempts = 4;

  while (attempt < maxAttempts) {
    for (const apiKey of apiKeys) {
      try {
        const callOptions: ProviderCallOptions = { apiKey, model: selectedModel, prompt };
        
        switch (activeProvider) {
          case "mistral": return await callMistral(callOptions);
          case "openai": return await callOpenAI(callOptions);
          case "anthropic": return await callAnthropic(callOptions);
          case "gemini": return await callGemini(callOptions);
          default: throw new Error("unknown_provider");
        }
      } catch (error: any) {
        lastError = error;
        if (error.message === "rate_limit" || error.message === "invalid_api_key") {
          continue;
        }
        throw error;
      }
    }

    if (lastError?.message === "rate_limit") {
      attempt++;
      if (attempt < maxAttempts) {
        const delay = Math.pow(2, attempt - 1) * 2000; // 2s, 4s, 8s
        await new Promise((r) => setTimeout(r, delay));
      }
    } else {
      break;
    }
  }

  throw lastError || new Error("unknown_error");
}

export async function testApiKey(
  provider: ProviderID,
  apiKey: string,
  model?: string,
): Promise<void> {
  const prompt = '{"status":"ok"}'; // Since some providers expect JSON
  // Anthropic requires a bit more structure sometimes, but a simple prompt works.
  await callLLM(prompt, { provider, apiKey, model });
}
