import { MISTRAL_API_URL, DEFAULT_MODEL } from "../constants";
import { getSetting } from "../storage";

interface CallMistralOptions {
  apiKey?: string;
  model?: string;
}

export async function callMistral(
  prompt: string,
  options?: CallMistralOptions,
): Promise<string> {
  const settingKey = await getSetting("mistralApiKey");
  const apiKeysStr = (options?.apiKey ?? settingKey ?? "").trim();
  const apiKeys = apiKeysStr.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);
  if (apiKeys.length === 0) {
    throw new Error("missing_api_key");
  }

  const selectedModel =
    options?.model || (await getSetting("selectedModel")) || DEFAULT_MODEL;

  let lastError: Error | null = null;

  for (const apiKey of apiKeys) {
    try {
      const response = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("invalid_api_key");
        if (response.status === 429) throw new Error("rate_limit");
        if (response.status >= 500) throw new Error("api_error");
        throw new Error("network_error");
      }

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      return data.choices?.[0]?.message?.content || "";
    } catch (error: any) {
      lastError = error;
      if (error.message === "rate_limit" || error.message === "invalid_api_key") {
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error("unknown_error");
}

export async function testApiKey(
  apiKey?: string,
  model?: string,
): Promise<void> {
  const prompt = 'Say "ok" and nothing else.';
  await callMistral(prompt, { apiKey, model });
}
