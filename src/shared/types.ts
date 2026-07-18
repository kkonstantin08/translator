export interface Settings {
  mistralApiKey: string;
  selectedModel: string;
  defaultTargetLanguage: "ru" | "en";
  llmEnabled: boolean;
  fallbackProvider: "chrome" | "libretranslate" | "none";
  libreTranslateEndpoint: string;
  excludedSites: string[];
  theme: "light" | "dark" | "system";
}

export interface WordTranslationResult {
  detectedLanguage: "en" | "ru" | "unknown";
  targetLanguage: "ru" | "en";
  word: string;
  mainTranslation: string;
  alternatives: string[];
  partOfSpeech: string;
  pronunciation: string;
  shortExamples: { source: string; translation: string }[];
}

export interface PhraseTranslationResult {
  detectedLanguage: "en" | "ru" | "unknown";
  targetLanguage: "ru" | "en";
  translation: string;
}

export type TranslationResult = WordTranslationResult | PhraseTranslationResult;

export interface TranslationRequest {
  text: string;
  mode: "word" | "phrase" | "popup";
  sourceLanguage?: "auto" | "en" | "ru";
  targetLanguage?: "ru" | "en";
}
