export interface ProviderCallOptions {
  apiKey: string;
  model: string;
  prompt: string;
}

export async function callMistral(options: ProviderCallOptions): Promise<string> {
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages: [{ role: "user", content: options.prompt }],
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

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function callOpenAI(options: ProviderCallOptions): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages: [{ role: "user", content: options.prompt }],
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

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function callAnthropic(options: ProviderCallOptions): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": options.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerously-allow-browser": "true",
    },
    body: JSON.stringify({
      model: options.model,
      max_tokens: 4000,
      messages: [{ role: "user", content: options.prompt }],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("invalid_api_key");
    if (response.status === 429) throw new Error("rate_limit");
    if (response.status >= 500) throw new Error("api_error");
    throw new Error("network_error");
  }

  const data = await response.json();
  // Claude returns { content: [{text: "..."}] }
  // We need to extract the json string from the markdown since we don't have response_format
  const text = data.content?.[0]?.text || "";
  return extractJsonFromMarkdown(text);
}

export async function callGemini(options: ProviderCallOptions): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${options.model}:generateContent?key=${options.apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: options.prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    if (response.status === 400) throw new Error("invalid_api_key"); // Gemini usually returns 400 on bad key if part of URL
    if (response.status === 403) throw new Error("invalid_api_key");
    if (response.status === 429) throw new Error("rate_limit");
    if (response.status >= 500) throw new Error("api_error");
    throw new Error("network_error");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function extractJsonFromMarkdown(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    return match[1].trim();
  }
  return text.trim();
}
