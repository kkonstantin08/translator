export const PROVIDERS = [
  { id: "mistral", name: "Mistral" },
  { id: "openai", name: "OpenAI (ChatGPT)" },
  { id: "anthropic", name: "Anthropic (Claude)" },
  { id: "gemini", name: "Google Gemini" }
] as const;

export const MODELS = {
  mistral: [
    { id: "mistral-small-latest", name: "Mistral Small (быстрый)" },
    { id: "mistral-medium-latest", name: "Mistral Medium" },
    { id: "mistral-large-latest", name: "Mistral Large (точный)" },
  ],
  openai: [
    { id: "gpt-4o-mini", name: "GPT-4o Mini (быстрый)" },
    { id: "gpt-4o", name: "GPT-4o (умный)" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo" }
  ],
  anthropic: [
    { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku (быстрый)" },
    { id: "claude-3-5-sonnet-20240620", name: "Claude 3.5 Sonnet (умный)" },
    { id: "claude-3-opus-20240229", name: "Claude 3 Opus" }
  ],
  gemini: [
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" }
  ]
};

export const FALLBACK_PROVIDERS = [
  { id: "chrome_ai", name: "Chrome Built-in AI (Gemini Nano)" },
  { id: "chrome", name: "Chrome Translation API" },
  { id: "libretranslate", name: "LibreTranslate" },
] as const;

export const UI_STRINGS = {
  translate: "Перевести",
  copy: "Копировать",
  copied: "Скопировано",
  speak: "Озвучить",
  settings: "Настройки",
  apiKeyLabel: "API ключи",
  checkKey: "Проверить",
  keyWorks: "Работает",
  missingKey: "Укажите API ключ в настройках расширения.",
  networkError: "Ошибка сети. Проверьте подключение.",
  invalidKey: "Неверный API ключ.",
  rateLimit: "Превышен лимит запросов.",
  llmDisabled: "LLM отключён. Настройте fallback-переводчик в настройках.",
  translatePage: "Перевести страницу (экспериментально)",
  restorePage: "Вернуть оригинал",
} as const;
