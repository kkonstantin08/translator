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
  const apiKey = (options?.apiKey ?? (await getSetting("mistralApiKey"))).trim();
  if (!apiKey) {
    throw new Error("missing_api_key");
  }

  const selectedModel =
    options?.model || (await getSetting("selectedModel")) || DEFAULT_MODEL;

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
}

export async function testApiKey(
  apiKey?: string,
  model?: string,
): Promise<void> {
  const prompt = 'Say "ok" and nothing else.';
  await callMistral(prompt, { apiKey, model });
}
