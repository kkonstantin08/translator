import type { Settings } from "./types";

const DEFAULT_SETTINGS: Settings = {
  mistralApiKey: "",
  selectedModel: "mistral-small-latest",
  defaultTargetLanguage: "ru",
  llmEnabled: true,
  fallbackProvider: "none",
  libreTranslateEndpoint: "",
  excludedSites: [],
  theme: "system",
};

export async function getSettings(): Promise<Settings> {
  const keys = Object.keys(DEFAULT_SETTINGS);
  const result = await chrome.storage.sync.get(keys);
  return {
    ...DEFAULT_SETTINGS,
    ...(result as Record<string, unknown>),
  } as unknown as Settings;
}

export async function setSettings(settings: Partial<Settings>): Promise<void> {
  await chrome.storage.sync.set(settings);
}

export async function getSetting<K extends keyof Settings>(
  key: K,
): Promise<Settings[K]> {
  const result = await chrome.storage.sync.get(key);
  return (result[key] ?? DEFAULT_SETTINGS[key]) as Settings[K];
}
