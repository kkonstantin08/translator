import type { Settings, TranslationRequest, TranslationResult } from "../types";

export async function translateWithFallback(
  request: TranslationRequest,
  settings: Settings,
): Promise<TranslationResult> {
  const targetLang = request.targetLanguage || settings.defaultTargetLanguage;

  if (settings.fallbackProvider === "chrome") {
    try {
      const result = await translateWithChrome(request.text, targetLang);
      if (result) {
        return {
          detectedLanguage: "unknown",
          targetLanguage: targetLang,
          translation: result,
        } as TranslationResult;
      }
    } catch {
      // Continue to next fallback
    }
  }

  if (
    settings.fallbackProvider === "libretranslate" &&
    settings.libreTranslateEndpoint
  ) {
    try {
      const result = await translateWithLibreTranslate(
        request.text,
        targetLang,
        settings.libreTranslateEndpoint,
      );
      if (result) {
        return {
          detectedLanguage: "unknown",
          targetLanguage: targetLang,
          translation: result,
        } as TranslationResult;
      }
    } catch {
      // Continue
    }
  }

  throw new Error("llm_disabled_no_fallback");
}

async function translateWithChrome(
  text: string,
  targetLang: "ru" | "en",
): Promise<string | null> {
  // Chrome does not expose a translation API to extensions.
  // This fallback is reserved for future use if such API becomes available.
  void text;
  void targetLang;
  return null;
}

async function translateWithLibreTranslate(
  text: string,
  targetLang: "ru" | "en",
  endpoint: string,
): Promise<string | null> {
  const sourceLang = targetLang === "ru" ? "en" : "ru";

  const response = await fetch(`${endpoint}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: sourceLang,
      target: targetLang,
      format: "text",
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { translatedText?: string };
  return data.translatedText || null;
}
