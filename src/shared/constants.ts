export const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

export const MISTRAL_MODELS = [
  { id: "mistral-small-latest", name: "Mistral Small (быстрый)" },
  { id: "mistral-medium-latest", name: "Mistral Medium" },
  { id: "mistral-large-latest", name: "Mistral Large (точный)" },
] as const;

export const DEFAULT_MODEL = "mistral-small-latest";

export const FALLBACK_PROVIDERS = [
  { id: "chrome", name: "Chrome Built-in Translator" },
  { id: "libretranslate", name: "LibreTranslate" },
] as const;

export const UI_STRINGS = {
  translate: "Перевести",
  copy: "Копировать",
  copied: "Скопировано",
  speak: "Озвучить",
  settings: "Настройки",
  apiKeyLabel: "API ключ Mistral",
  checkKey: "Проверить ключ",
  keyWorks: "Ключ работает",
  missingKey: "Укажите API ключ в настройках расширения.",
  networkError: "Ошибка сети. Проверьте подключение.",
  invalidKey: "Неверный API ключ.",
  rateLimit: "Превышен лимит запросов.",
  llmDisabled: "LLM отключён. Настройте fallback-переводчик в настройках.",
  translatePage: "Перевести страницу (экспериментально)",
  restorePage: "Вернуть оригинал",
} as const;
